import { useState, useEffect, useRef } from "react";
import { useWebSocket, webSocket } from "../hooks/useWebSocket";
import "./TeamChat.css";

export function TeamChat({ teamId, username }) {
  const { connected, send, lastMessage } = useWebSocket(teamId);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [typing, setTyping] = useState(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "CHAT_MESSAGE") {
      setMessages((prev) => [...prev, lastMessage.data]);
      
      // Remove from typing indicator
      setTyping((prev) => {
        const next = new Set(prev);
        next.delete(lastMessage.data.username);
        return next;
      });
    } else if (lastMessage.type === "USER_TYPING") {
      setTyping((prev) => new Set(prev).add(lastMessage.data.username));
      
      // Clear typing after 3s
      setTimeout(() => {
        setTyping((prev) => {
          const next = new Set(prev);
          next.delete(lastMessage.data.username);
          return next;
        });
      }, 3000);
    }
  }, [lastMessage]);

  useEffect(() => {
    // Scroll to bottom when new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const message = {
      type: "CHAT_MESSAGE",
      teamId,
      data: {
        username: username || "Anonymous",
        text: inputText.trim(),
        timestamp: Date.now(),
      },
    };

    send(message);
    setInputText("");
  };

  const handleTyping = () => {
    send({
      type: "USER_TYPING",
      teamId,
      data: { username: username || "Anonymous" },
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="team-chat">
      <div className="chat-header">
        <h3>💬 Team Chat</h3>
        <div className="connection-status">
          <span className={`status-dot ${connected ? "connected" : "disconnected"}`}></span>
          {connected ? "Live" : "Connecting..."}
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <div>No messages yet</div>
            <div className="no-messages-hint">Start chatting with your team!</div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.username === username ? "own" : "other"}`}
              >
                <div className="message-header">
                  <span className="message-username">{msg.username}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {typing.size > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            {Array.from(typing).join(", ")} {typing.size === 1 ? "is" : "are"} typing...
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            handleTyping();
          }}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          disabled={!connected}
        />
        <button onClick={sendMessage} disabled={!connected || !inputText.trim()}>
          Send
        </button>
      </div>

      <div className="chat-tips">
        <strong>Tips:</strong> Share qubit status, coordinate landmark visits, or just
        say hi! 👋
      </div>
    </div>
  );
}