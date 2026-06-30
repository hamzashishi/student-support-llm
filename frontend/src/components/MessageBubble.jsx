// frontend/src/components/MessageBubble.jsx
function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`message-wrapper ${isUser ? 'user-wrapper' : 'assistant-wrapper'}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        <div className="message-role">
          {isUser ? '🎓 You' : '🤖 Assistant'}
        </div>
        <div className="message-text">{message.text}</div>
        <div className="message-time">{message.time}</div>
      </div>
    </div>
  );
}
export default MessageBubble;
