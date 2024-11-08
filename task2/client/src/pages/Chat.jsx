import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/Auth";
import { io } from "socket.io-client";
import moment from "moment";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [archivedConversations, setArchivedConversations] = useState([]);
  const [auth] = useAuth();
  const [selectedConversation, setSelectedConversation] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const navigate = useNavigate();

  const socket = useSocket();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const messageRef = useRef(null);

  useEffect(() => {
    messageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  useEffect(() => {
    try {
      socket?.emit("addUser", auth?.user?._id);

      socket?.on("getUsers", (users) => {
        // console.log("Active users " + users[0].userId);
      });

      socket?.on("getMessage", (data) => {
        console.log(data);
        setMessages((prev) => [
          ...prev,
          {
            message: data.message,
            user: {
              ...prev,
              ...data.user,
            },
            time: data.time,
          },
        ]);
      });
    } catch (error) {
      console.log(error);
    }
  }, [socket]);

  const fetchUnarchivedConversations = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/conversation/conversations/${auth?.user?._id}/?archived=false`
      );
      setConversations(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchArchivedConversations = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/conversation/conversations/${auth?.user?._id}/?archived=true`
      );

      console.log(data);
      setArchivedConversations(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUnarchivedConversations();
  }, [auth?.user?._id]);

  useEffect(() => {
    fetchArchivedConversations();
  }, [auth?.user?._id]);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/message/messages/${selectedConversation}`
      );

      setMessages(data);
    } catch (error) {
      console.log(error);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation && selectedUserId) fetchMessages();
  }, [fetchMessages]);

  const setConversation = (conversationId, username, id) => {
    setSelectedConversation(conversationId);
    setSelectedUserName(username);
    setSelectedUserId(id);
  };

  const sendMessage = async () => {
    try {
      socket.emit("sendMessage", {
        senderId: auth?.user?._id,
        conversationId: selectedConversation,
        message: newMessage,
        receiverId: selectedUserId,
      });

      const { data } = await axios.post(
        "http://localhost:5000/api/v1/message/create-message",
        {
          senderId: auth?.user?._id,
          conversationId: selectedConversation,
          message: newMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(data);
      setNewMessage("");
      // fetchMessages();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteConversation = async (id) => {
    try {
      const { data } = await axios.delete(
        "http://localhost:5000/api/v1/conversation/delete-conversation/" +
          selectedConversation
      );

      if (data.success) {
        handleClose();

        // fetchUnarchivedConversations();

        socket.emit("deleteConversation", {
          senderId: auth?.user?._id,
          receiverId: selectedUserId,
          message: "deleted",
        });

        setSelectedConversation("");
        setSelectedUserId("");
        setSelectedUserName("");
      }
      // console.log(id);
      // const conversationIndex = conversations.findIndex(
      //   (conversation) => conversation.conversationId === id
      // );

      // if (conversationIndex !== -1) {
      //   const updatedConversations = [...conversations];
      //   // const deletedConversation = updatedConversations.splice(
      //   //   conversationIndex,
      //   //   1
      //   // );
      //   // console.log(deletedConversation);
      //   // setConversations(updatedConversations);

      //   const result = window.confirm("Do you want to undo this conversation?");
      //   console.log(result);

      // }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket?.on("deleteConversation", (data) => {
      if (data.message === "deleted") {
        fetchUnarchivedConversations();
      }
    });
  }, [socket]);

  const archiveConversationForUser = async () => {
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/v1/conversation/archive-conversation`,
        {
          userId: auth?.user?._id,
          conversationId: selectedConversation,
          targetUserId: selectedUserId,
        }
      );

      console.log(data);

      if (data.success) {
        setSelectedConversation("");
        setSelectedUserId("");
        setSelectedUserName("");

        fetchUnarchivedConversations();
        fetchArchivedConversations();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container-fluid p-4">
      <h1 className="text-center">Chat</h1>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Deleting this conversation will delete all the data for both the users
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => deleteConversation(selectedConversation)}
          >
            Delete Chat
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="d-flex gap-5" style={{ minHeight: "80vh" }}>
        <div
          className="connected-users col-lg-3 col-md-4 p-3"
          style={{ backgroundColor: "lightBlue" }}
          key={Math.random() + Date.now()}
        >
          <h3 className="text-center">Your Connections</h3>

          {conversations.length !== 0 ? (
            conversations.map((connectedUser) => (
              <div
                className={`py-2 px-2 my-3 d-flex gap-2 rounded align-items-center ${
                  connectedUser?.user?.id === selectedUserId
                    ? "bg-primary text-white"
                    : "bg-light text-black"
                }`}
                style={{ cursor: "pointer", position: "relative" }}
                onClick={() => {
                  setConversation(
                    connectedUser?.conversationId,
                    connectedUser?.user?.name,
                    connectedUser?.user?.id
                  );
                }}
              >
                <div
                  className="bg-success p-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                  }}
                >
                  <span className="fs-3 text-white fw-bold">
                    {connectedUser?.user?.name[0].toUpperCase()}
                  </span>
                </div>
                <div className="d-flex flex-column">
                  <span className="m-0 fs-5" style={{ fontWeight: "600" }}>
                    {connectedUser?.user?.name}
                  </span>
                  <span
                    className="m-0"
                    style={{ fontWeight: "400", fontSize: "16px" }}
                  >
                    {connectedUser?.user?.email}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <p className="fs-3">No Connected Users</p>
            </div>
          )}
        </div>

        {selectedConversation && selectedUserId ? (
          <div className="col-lg-5 col-md-6 border p-2 d-flex flex-column justify-content-between">
            <div className="bg-primary rounded d-flex justify-content-between align-items-center px-3">
              <p className="text-white p-2 fs-4 m-0">{selectedUserName}</p>
              <div
                className="d-flex gap-3 align-items-center"
                style={{
                  color: "white",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  class="bi bi-archive-fill"
                  viewBox="0 0 16 16"
                  style={{
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={archiveConversationForUser}
                >
                  <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1M.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8z" />
                </svg>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="bi bi-trash3-fill"
                  viewBox="0 0 16 16"
                  style={{
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={handleShow}
                >
                  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                </svg>
              </div>
            </div>

            <div
              className="messages"
              style={{
                maxHeight: "60vh",
                overflowY: "auto",
              }}
            >
              {messages.length !== 0 ? (
                messages.map((message) =>
                  message.user.id === selectedUserId ? (
                    <div className="message-left mx-2 my-3 d-flex flex-column align-items-start">
                      <span
                        className="bg-success rounded p-2 text-white"
                        style={{ fontSize: "18px" }}
                      >
                        {message.message}
                      </span>
                      <span>{moment(message.time).format("lll")}</span>
                    </div>
                  ) : (
                    <div className="message-right mx-2 my-3 d-flex flex-column align-items-end">
                      <span
                        className="bg-primary text-white p-2 rounded"
                        style={{ fontSize: "18px" }}
                      >
                        {message.message}
                      </span>
                      <span>{moment(message.time).format("lll")}</span>
                    </div>
                  )
                )
              ) : (
                <div className="d-flex justify-content-center align-items-center w-100">
                  <p className="fs-3">No Messages</p>
                </div>
              )}

              <div ref={messageRef}></div>
            </div>

            <div className="row message-box d-flex justify-content-center gap-3">
              <input
                type="text"
                className="form-control"
                style={{ width: "80%", border: "1px solid grey" }}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="btn btn-primary"
                style={{ width: "100px" }}
                onClick={() => sendMessage()}
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="d-flex col-lg-5 col-md-6 justify-content-center align-items-center">
            <span className="fs-3 text-center">
              Please select a conversation to start messaging
            </span>
          </div>
        )}

        <div
          className="connected-users col-lg-3 col-md-4 p-3"
          style={{ backgroundColor: "lightBlue" }}
          key={Math.random() + Date.now()}
        >
          <h3 className="text-center">Archives</h3>

          {archivedConversations.length !== 0 ? (
            archivedConversations.map((archivedUser) => (
              <div
                className={`py-2 px-2 my-3 d-flex gap-2 rounded align-items-center ${
                  archivedUser?.user?.id === selectedUserId
                    ? "bg-primary text-white"
                    : "bg-light text-black"
                }`}
                style={{ cursor: "pointer", position: "relative" }}
                onClick={() => {
                  setConversation(
                    archivedUser?.conversationId,
                    archivedUser?.user?.name,
                    archivedUser?.user?.id
                  );
                }}
              >
                <div
                  className="bg-success p-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                  }}
                >
                  <span className="fs-3 text-white fw-bold">
                    {archivedUser?.user?.name[0].toUpperCase()}
                  </span>
                </div>
                <div className="d-flex flex-column">
                  <span className="m-0 fs-5" style={{ fontWeight: "600" }}>
                    {archivedUser?.user?.name}
                  </span>
                  <span
                    className="m-0"
                    style={{ fontWeight: "400", fontSize: "16px" }}
                  >
                    {archivedUser?.user?.email}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <p className="fs-3">No Archived Users</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
