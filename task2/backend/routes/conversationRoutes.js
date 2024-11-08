const express = require("express");
const {
  createConversationController,
  getUserSpecificConversationsController,
  deleteConversationController,
  archiveConversationController,
} = require("../controllers/conversationController");
const router = express.Router();

router.post("/create-conversation", createConversationController);

router.get("/conversations/:userId", getUserSpecificConversationsController);

router.delete(
  "/delete-conversation/:conversationId",
  deleteConversationController
);

router.post("/archive-conversation", archiveConversationController);

module.exports = router;
