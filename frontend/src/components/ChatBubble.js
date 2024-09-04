import React from 'react';
import teacherIcon from '../teacher.png'; 
import studentIcon from '../student.png'; 

const ChatBubble = ({ sender, type, text, src, alt }) => (
  <div className={`chat-bubble ${sender}`}>
    <img src={sender === "teacher" ? teacherIcon : studentIcon} alt={`${sender} icon`} className="icon" />
    {type === "image" ? (
      <img src={src} alt={alt} className="image" />
    ) : (
      <p>{text}</p>
    )}
  </div>
);

export default ChatBubble;
