import React, { useState } from 'react';

const ChatBubble = ({ sender, type, text, src, alt, tableData }) => {
  const teacherIconPath = "/images/teacher.png";
  const studentIconPath = "/images/student.png";
  
  // 画像モーダルの表示状態を管理するuseStateフック
  const [isModalOpen, setIsModalOpen] = useState(false);

  // モーダルを開く関数
  const openModal = () => {
    setIsModalOpen(true);
  };

  // モーダルを閉じる関数
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={`chat-bubble ${sender}`}>
      <img 
        src={sender === "teacher" ? teacherIconPath : studentIconPath} 
        alt={`${sender} icon`} 
        className="icon" 
      />
      {type === "image" ? (
        <>
          {/* 通常の画像表示 */}
          <img src={src} alt={alt} className="image" onClick={openModal} style={{ cursor: 'pointer' }} />
          
          {/* モーダル（全画面表示） */}
          {isModalOpen && (
            <div className="modal" onClick={closeModal}>
              <span className="close">&times;</span>
              <img className="modal-image" src={src} alt={alt} />
            </div>
          )}
        </>
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
