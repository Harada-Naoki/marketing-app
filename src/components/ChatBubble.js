import React from 'react';

const ChatBubble = ({ sender, type, text, src, alt }) => {
  const teacherIconPath = "/images/teacher.png";
  const studentIconPath = "/images/student.png";

  return (
    <div className={`chat-bubble ${sender}`}>
      <img 
        src={sender === "teacher" ? teacherIconPath : studentIconPath} 
        alt={`${sender} icon`} 
        className="icon" 
      />
      {type === "image" ? (
        <img src={src} alt={alt} className="image" />
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
};
export default ChatBubble;
