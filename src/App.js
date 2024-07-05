import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import teacherIcon from './teacher.png';
import studentIcon from './student.png';

function App() {
  const [visibleStep, setVisibleStep] = useState(0);
  const chatContainerRef = useRef(null);

  const showNextStep = () => setVisibleStep(visibleStep + 1);

  const content = [
    {
      sender: "teacher",
      text: "こんにちは、今日はマーケティングについて学びましょう。",
      icon: teacherIcon
    },
    {
      sender: "student",
      text: "こんにちは先生！マーケティングって何ですか？",
      icon: studentIcon
    },
    {
      sender: "teacher",
      text: "マーケティングは、製品やサービスを顧客に届けるための活動や戦略のことを指します。",
      icon: teacherIcon
    },
    {
      sender: "student",
      text: "マーケティングの目的は何ですか？",
      icon: studentIcon
    },
    {
      sender: "teacher",
      text: "マーケティングの目的は、顧客のニーズを満たし、企業の利益を上げることです。",
      icon: teacherIcon
    },
    {
      sender: "student",
      text: "マーケティングミックスって何ですか？",
      icon: studentIcon
    },
    {
      sender: "teacher",
      text: "マーケティングミックスは、4つのP（製品、価格、場所、プロモーション）で構成されています。",
      icon: teacherIcon
    },
    {
      sender: "student",
      text: "マーケティングリサーチは重要ですか？",
      icon: studentIcon
    },
    {
      sender: "teacher",
      text: "はい、マーケティングリサーチは、顧客のニーズや市場の動向を理解するために重要です。",
      icon: teacherIcon
    }
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleStep]);

  return (
    <div className="App">
      <h1>マーケティングを学ぼう</h1>
      <div className="chat-container" ref={chatContainerRef}>
        {content.slice(0, visibleStep + 1).map((item, index) => (
          <div key={index} className={`chat-bubble ${item.sender}`}>
            <img src={item.icon} alt={`${item.sender} icon`} className="icon" />
            <p>{item.text}</p>
          </div>
        ))}
      </div>
      {visibleStep < content.length - 1 && (
        <button onClick={showNextStep} className="next-button">次へ</button>
      )}
    </div>
  );
}

export default App;
