const Conversation = require("../models/Conversation");
const Messages = require("../models/Message");
const User = require("../models/User");

module.exports.createMessageController = async (req, res) => {
  try {
    const { senderId, conversationId, message, receiverId = "" } = req.body;

    if (!senderId || !message) {
      return res.status(400).json({
        success: false,
        message: "Provide senderId, conversationId and message",
      });
    }

    if (!conversationId) {
      const newConversation = await Conversation.create({
        members: [senderId, receiverId],
      });

      const newMessage = await Messages.create({
        conversationId: newConversation._id,
        senderId,
        message,
      });

      return res.status(200).json({
        success: true,
        message: "Message sent successfully",
      });
    }

    const newMessage = await Messages.create({
      conversationId,
      senderId,
      message,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.getMessagesController = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    if (conversationId === "new") {
      return res.status(200).json([]);
    }

    const messages = await Messages.find({ conversationId });

    const userMessageData = Promise.all(
      messages.map(async (message) => {
        const user = await User.findById(message.senderId).select("-password");
        return {
          user: { id: user._id, email: user.email, name: user.name },
          message: message.message,
          time: message.createdAt,
        };
      })
    );

    res.status(200).json(await userMessageData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
