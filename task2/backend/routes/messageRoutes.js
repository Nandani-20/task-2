const express = require("express");
const { createMessageController, getMessagesController } = require("../controllers/messageController");
const router = express.Router();

router.post("/create-message", createMessageController);

router.get("/messages/:conversationId", getMessagesController);

module.exports = router;
