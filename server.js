const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const connectDB = require('./config/db');
const path = require('path');
const passport = require('passport');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

connectDB();
let users = [];
app.use(passport.initialize());

io.on('connection', function (socket) {
  console.log('A user connected');

  // Attach incoming listener for new user
  socket.on('user_connected', async (user_id) => {
    // Save in array
    users[user_id] = socket.id;
    // Socket id will be used to send message to individaul person
    console.log(users);
    // Notify all connected users
    io.emit('user_connected', user_id);
  });
  socket.on('send_message', async (data) => {
    // Send Event To The Receiver
    const socketIdSender = users[data.recciver];
    const socketIdReceiver = users[data.sender];

    const messageId = Message.createNewMessageId();

    try {
      await Message.findOneAndUpdate(
        { owner: data.sender, corresponder: data.recciver },
        {
          $push: {
            messages: {
              _id: messageId,
              message: data.message,
              isSent: true,
              read: true
            }
          },
          $set: { hasNewMessage: true }
        },
        { new: true, upsert: true }
      ).exec();
      await Message.updateOne(
        { owner: data.recciver, corresponder: data.sender },
        {
          $push: { messages: { message: data.message } }
        },
        { new: true, upsert: true }
      ).exec();

      const senderMessages = await Message.findOneAndUpdate(
        { owner: data.recciver, corresponder: data.sender },
        { $set: { hasNewMessage: false } },
        { new: true, upsert: true }
      )
        .populate({
          path: 'corresponder',
          select: 'name avatar'
        })
        .exec();
      const receiverMessages = await Message.findOneAndUpdate(
        { owner: data.sender, corresponder: data.recciver },
        { $set: { hasNewMessage: true } },
        { new: true, upsert: true }
      )
        .populate({
          path: 'corresponder',
          select: 'name avatar'
        })
        .exec();

      if (socketIdSender === undefined) {
        const notification = new Notification({
          sender: data.sender,
          message: `Message: ${data.message}`,
          kind: 'message',
          receiver: [data.recciver]
        });
        await notification.save();
      }
      io.to(socketIdSender).emit('new_message', senderMessages);
      io.to(socketIdReceiver).emit('new_message', receiverMessages);
    } catch (error) {
      console.log(error.message);
    }
  });
  socket.on('disconnect', () => {
    // After the user disconnect i deleted from the users array
    console.log('User Disconnected');
    for (const property in users) {
      if (socket.id === users[property]) {
        delete users[property];
      }
    }
  });
});

// Init Middleware
app.use(express.json({ extended: false }));
//
// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/groups', require('./routes/api/groups'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/friends', require('./routes/api/friends'));

app.use('/api/social', require('./routes/api/social'));

app.use('/api/users/message', require('./routes/api/message'));
app.use('/api/search', require('./routes/api/search'));
app.use('/api/notification', require('./routes/api/notification'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
