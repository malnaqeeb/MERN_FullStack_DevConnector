const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    },
  ],
  emojis: [
    {
      users: [
        {
          type: Schema.Types.ObjectId,
          ref: 'users',
        },
      ],
      amount: Number,
      emoji: {
        colons: { type: String },
        emoticons: [String],
        id: { type: String },
        name: { type: String },
        native: { type: String },
        short_names: [String],
        skin: { type: Number },
        unified: { type: String },
      },
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      text: {
        type: String,
        required: true,
        trim: true,
      },
      avatar: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      likes: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
          },
        },
      ],
      emojis: [
        {
          users: [
            {
              type: Schema.Types.ObjectId,
              ref: 'users',
            },
          ],
          amount: Number,
          emoji: {
            colons: { type: String },
            emoticons: [String],
            id: { type: String },
            name: { type: String },
            native: { type: String },
            short_names: [String],
            skin: { type: Number },
            unified: { type: String },
          },
        },
      ],
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  link:{
    type: String,
  }
});

module.exports = Post = mongoose.model('post', PostSchema);
