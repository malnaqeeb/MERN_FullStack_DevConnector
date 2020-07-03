const mongoose = require('mongoose');

const thisSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'user'
    },
    corresponder: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'user'
    },
    hasNewMessage: {
      type: Boolean,
      default: false
    },

    messages: [
      {
        message: {
          type: String,
          required: true,
          trim: true
        },
        date: {
          type: Date,
          default: Date.now(),
          required: true
        },
        isSent: {
          type: Boolean,
          default: false,
          required: true
        },
        read: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

thisSchema.statics.createNewMessageId = () => {
  return new mongoose.Types.ObjectId();
};

module.exports = mongoose.model('Message', thisSchema);
