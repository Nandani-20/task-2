import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";
import { useAuth } from "../context/Auth";
import { useParams } from "react-router-dom";

// Connect to socket server (make sure the URL matches your backend)
const socket = io("http://localhost:5000");

const VideoCall = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [myStream, setMyStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [auth] = useAuth();
  const { id } = useParams();

  useEffect(() => {
    setSelectedUser(id);
  }, [id]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing media devices: ", err));
  }, []);

  const startVideoCall = () => {
    setIsCalling(true);

    const newPeer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: myStream,
    });

    newPeer.on("signal", (offer) => {
      socket.emit("videoCallOffer", {
        offer,
        senderId: auth?.user?._id,
        receiverId: selectedUser,
      });
    });

    newPeer.on("stream", (stream) => {
      remoteVideoRef.current.srcObject = stream;
    });

    setPeer(newPeer);
  };

  useEffect(() => {
    socket.on("videoCallOffer", ({ offer, senderId }) => {
      console.log("Offering");
      setIncomingCall({ offer, senderId });
    });
  }, [socket, setIncomingCall]);

  const acceptCall = () => {
    const newPeer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: myStream,
    });

    newPeer.on("signal", (answer) => {
      socket.emit("videoCallAnswer", {
        answer,
        senderId: incomingCall.senderId,
        receiverId: auth?.user?._id,
      });
    });

    newPeer.on("stream", (stream) => {
      remoteVideoRef.current.srcObject = stream;
    });

    newPeer.signal(incomingCall.offer);
    setPeer(newPeer);
    setIsInCall(true);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    setIncomingCall(null);
  };

  useEffect(() => {
    socket.on("videoCallAnswer", ({ answer, receiverId }) => {
      peer.signal(answer);
      setIsInCall(true);
    });
  }, [peer]);

  useEffect(() => {
    socket.on("iceCandidate", ({ candidate, senderId }) => {
      if (peer) peer.addIceCandidate(candidate);
    });
  }, [peer]);

  return (
    <div>
      <div>
        <video ref={localVideoRef} autoPlay muted />
        <video ref={remoteVideoRef} autoPlay />
      </div>
      <div>
        {!isInCall && !isCalling && (
          <button onClick={startVideoCall}>Start Video Call</button>
        )}

        {isCalling && <p>Calling...</p>}
        {isInCall && <p>In a Call</p>}

        {incomingCall && !isInCall && (
          <div>
            <p>Incoming Call...</p>
            <button onClick={acceptCall}>Accept</button>
            <button onClick={rejectCall}>Reject</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
