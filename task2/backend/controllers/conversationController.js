const Conversation = require("../models/Conversation");
const User = require("../models/User");
const Messages = require("../models/Message");

module.exports.createConversationController = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: "Provide both senderId and receiverId",
      });
    }

    const conversation = await Conversation.create({
      members: [senderId, receiverId],
    });

    res.status(201).json({
      success: true,
      message: "Conversation created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// module.exports.getUserSpecificConversationsController = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     const conversations = await Conversation.find({
//       members: { $in: [userId] },
//     });

//     const userConversation = Promise.all(
//       conversations.map(async (conversation) => {
//         const receiverId = conversation.members.find(
//           (member) => member !== userId
//         );

//         const user = await User.findById(receiverId).select("-password");
//         return {
//           user: { id: user._id, email: user.email, name: user.name },
//           conversationId: conversation._id,
//         };
//       })
//     );

//     res.status(200).json(await userConversation);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

module.exports.getUserSpecificConversationsController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { archived } = req.query; // Check for 'archived' query parameter

    // Find all conversations where the user is a member
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    });

    // Filter conversations based on the 'archived' query parameter
    const filteredConversations = conversations.filter((conversation) => {
      // If 'archived' is passed as 'true', filter for archived conversations
      if (archived === "true") {
        return conversation.archived.get(userId) === true;
      }
      // If 'archived' is passed as 'false', filter for unarchived conversations
      if (archived === "false") {
        return conversation.archived.get(userId) !== true;
      }
      // If no 'archived' parameter is passed, return both archived and unarchived conversations
      return true;
    });

    // Prepare the user-specific conversation data
    const userConversation = await Promise.all(
      filteredConversations.map(async (conversation) => {
        // Find the other user in the conversation
        const receiverId = conversation.members.find(
          (member) => member !== userId
        );

        // Fetch user details for the other participant in the conversation
        const user = await User.findById(receiverId).select("-password");
        return {
          user: { id: user._id, email: user.email, name: user.name },
          conversationId: conversation._id,
        };
      })
    );

    // Return the filtered conversations
    res.status(200).json(userConversation);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.deleteConversationController = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    const deletedConversation = await Conversation.findByIdAndDelete(
      conversationId
    );

    const deletedMessages = await Messages.deleteMany({
      conversationId: conversationId,
    });

    console.log(deletedMessages);

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.archiveConversationController = async (req, res) => {
  try {
    const { userId, conversationId, targetUserId } = req.body;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation.members.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Target user is not part of this conversation.",
      });
    }

    if (!conversation.archived || !(conversation.archived instanceof Map)) {
      conversation.archived = new Map();
    }

    conversation.archived.set(userId, true);

    await conversation.save();

    res.status(200).json({
      success: true,
      message: `Conversation archived for user ${targetUserId} by ${userId} successfully.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
