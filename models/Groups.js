const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  description: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  events: [
    {
      title: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      place:{
        type:String
      },
      start: {
        type: Date,
        required: true
      },
      end: {
        type: Date,
        required:true
      },
      creator: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      }
    }
  ],
  posts: [
    {
      title: {
        type: String,
        required: true
      },
      creator: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },
      text: {
        type: String,
        required: true
      },
      link: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      emojis: [
        {
          users: [
            {
              type: Schema.Types.ObjectId,
              ref: 'users'
            }
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
            unified: { type: String }
          }
        }
      ],
      comments: [
        {
          creator: {
            type: Schema.Types.ObjectId,
            ref: 'user'
          },
          text: {
            type: String,
            required: true,
            trim: true
          },
          date: {
            type: Date,
            default: Date.now
          },
          avatar: {
            type: String
          },
          name: {
            type: String
          },
          userId: {
            type: String
          }
        }
      ]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  members: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },
      dateJoined: {
        type: Date,
        default: Date.now
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      }
    }
  ]
});

module.exports = Group = mongoose.model('group', GroupSchema);
