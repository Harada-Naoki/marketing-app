import React from 'react';

const ChatBubble = ({ sender, type, text, src, alt, tableData }) => {
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
      ) : type === "table" ? (
        <table className="table">
          {tableData.headers && ( 
            <thead>
              <tr>
                {tableData.headers.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {tableData.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
};

export default ChatBubble;