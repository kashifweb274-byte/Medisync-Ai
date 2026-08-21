import React, { useState, useEffect, useRef } from "react";
import "./VideoCallModal.css";

export default function VideoCallModal({ doctorName, doctorSpecialty, onClose }) {
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState("Connecting...");

  const userVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Timer setup
  useEffect(() => {
    let timer;
    const startTimer = setTimeout(() => {
      setCallStatus("Connected");
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 2000);

    return () => {
      clearTimeout(startTimer);
      clearInterval(timer);
    };
  }, []);

  // Browser Camera Access (WebRTC Stream)
  useEffect(() => {
    async function enableStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera/Mic access denied:", err);
      }
    }

    enableStream();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Toggle Mute Audio
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Video Track
  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOff(!videoTrack.enabled);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  return (
    <div className="wa-call-overlay">
      <div className="wa-call-container">
        {/* Header Bar */}
        <div className="wa-call-header">
          <div className="wa-enc-badge">🔒 End-to-end encrypted</div>
          <h2 className="wa-doc-name">{doctorName}</h2>
          <p className="wa-call-status">
            {callStatus === "Connected" ? formatTime(callDuration) : callStatus}
          </p>
        </div>

        {/* Main Video View (Doctor Placeholder/Remote Video) */}
        <div className="wa-main-video-area">
          <div className="wa-doctor-avatar-big">
            <span>{doctorName ? doctorName.replace("Dr. ", "")[0] : "D"}</span>
          </div>
          <p className="wa-doc-spec-text">{doctorSpecialty || "Specialist Consultation"}</p>
        </div>

        {/* Floating User Self-Video (PIP) */}
        <div className="wa-user-pip shadow-lg">
          {!cameraOff ? (
            <video ref={userVideoRef} autoPlay playsInline muted className="wa-self-video" />
          ) : (
            <div className="wa-pip-off">Camera Off</div>
          )}
        </div>

        {/* WhatsApp Floating Action Controls */}
        <div className="wa-controls-bar">
          <button
            className={`wa-control-btn ${micMuted ? "off" : ""}`}
            onClick={toggleMic}
            title={micMuted ? "Unmute" : "Mute"}
          >
            {micMuted ? "🎙️❌" : "🎙️"}
          </button>

          <button
            className={`wa-control-btn ${cameraOff ? "off" : ""}`}
            onClick={toggleCamera}
            title={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
          >
            {cameraOff ? "📹❌" : "📹"}
          </button>

          <button
            className="wa-control-btn btn-hangup"
            onClick={handleEndCall}
            title="End Call"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}