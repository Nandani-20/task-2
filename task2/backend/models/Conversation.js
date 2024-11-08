const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  members: {
    type: Array,
    required: true,
  },
  
  archived: {
    type: Map,
    of: Boolean,
    default: () => new Map(),
  },
});

const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = Conversation;
