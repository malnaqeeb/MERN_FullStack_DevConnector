const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
  // Notification creator
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  // Ids of the receivers of the notification
  receiver: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  message: String, // any description of the notification message
  kind: String,
  path: String,
  read_by: [
    {
      readerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      read_at: {
        type: Date,
        default: Date.now
      }
    }
  ],
  created_at: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Notification', NotificationSchema);
