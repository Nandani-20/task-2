const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

const Messages = mongoose.model("messages", MessageSchema);
module.exports = Messages;
