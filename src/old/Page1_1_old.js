import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiRequest from './utils/apiRequest';
import './App.css';
import teacherIcon from './teacher.png';
import studentIcon from './student.png';
import marketing_1 from './images_1/marketing_1.jpeg';
import marketing_2 from './images_1/marketing_2.jpeg';
import marketing_3 from './images_1/marketing_3.jpeg';
import marketing_4 from './images_1/marketing_4.jpeg';
import marketing_5 from './images_1/marketing_5.png';
import marketing_6 from './images_1/marketing_6.png';

function Page1() {
  const [visibleStep, setVisibleStep] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const chatContainerRef = useRef(null);
  const [studyTime, setStudyTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const navigate = useNavigate();

  const saveStudyTime = async (time) => {
    try {
      await apiRequest('/api/progress/update', {
        method: 'POST',
        data: {
          chapterId: 1, // 現在のチャプターIDを指定
          studyTime: time
        }
      });
    } catch (error) {
      console.error('Error saving study time', error);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' || document.hidden) {
        const endTime = Date.now();
        const elapsed = Math.floor((endTime - startTime) / 1000);
        setStudyTime(prevTime => {
          const newTime = prevTime + elapsed;
          saveStudyTime(newTime);
          return newTime;
        });
      } else {
        setStartTime(Date.now());
      }
    };

    const handleWindowFocus = () => {
      setStartTime(Date.now());
    };

    const handleWindowBlur = () => {
      const endTime = Date.now();
      const elapsed = Math.floor((endTime - startTime) / 1000);
      setStudyTime(prevTime => {
        const newTime = prevTime + elapsed;
        saveStudyTime(newTime);
        return newTime;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      const endTime = Date.now();
      const elapsed = Math.floor((endTime - startTime) / 1000);
      saveStudyTime(studyTime + elapsed);
    };
  }, [startTime, studyTime]);

  const completeChapter = async () => {
    try {
      const endTime = Date.now();
      const elapsed = Math.floor((endTime - startTime) / 1000);
      const totalStudyTime = studyTime + elapsed;
      await saveStudyTime(totalStudyTime); // チャプター完了時にも勉強時間を保存

      console.log('Sending complete request:', {
          chapterId: 1,
          completed: true,
          studyTime: totalStudyTime
      });

      const response = await apiRequest('/api/progress/update', {
          method: 'POST',
          data: {
              chapterId: 1,
              completed: true,
              studyTime: totalStudyTime
          }
      });

      console.log('Complete request response:', response);

      navigate('/');
  } catch (error) {
      console.error('Error completing chapter', error);
  }
  };

  const chapterOverview = "このチャプターでは、マーケティングの基本概念、現代のデジタルマーケティング、そしてマーケティングの重要なモデルと法則について学びます。";

  const content = [
    {
      sender: "teacher",
      text: "こんにちは、今日はマーケティングについて学びましょう。",
    },
    {
      sender: "student",
      text: "こんにちは先生！マーケティングって何ですか？",
    },
    {
      sender: "teacher",
      text: "マーケティングは、商品やサービスを売り続けるための仕組みを作ることです。それには、顧客が「買いたい」と思うような気持ちを引き出すことが含まれます。",
    },
    {
      sender: "student",
      text: "売れ続ける仕組みってどうやって作るんですか？",
    },
    {
      sender: "teacher",
      text: "売れ続ける仕組みを作るには、いくつかのステップがあります。まず、ターゲットとする顧客層を明確にすることが大切です。その後、顧客のニーズや欲求を理解し、それに応える商品やサービスを提供します。",
    },
    {
      sender: "teacher",
      type: "image",
      src: marketing_1,
      alt: "売れ続ける仕組みづくり",
    },
    {
      sender: "student",
      text: "具体的にはどんなことをするんですか？",
    },
    {
      sender: "teacher",
      text: "例えば、市場調査を行って顧客の意見を集めたり、競合他社の動向を分析したりします。さらに、効果的な広告を作成して、顧客にリーチするためのチャネルを選びます。",
    },
    {
      sender: "student",
      text: " 買いたい気持ちづくりについて教えてください。",
    },
    {
      sender: "teacher",
      text: "買いたい気持ちを作るためには、顧客に対して商品の価値や魅力を伝えることが重要です。これには、広告やプロモーション、商品レビューなどが含まれます。また、顧客との信頼関係を築くことも大切です。",
    },
    {
      sender: "teacher",
      type: "image",
      src: marketing_2,
      alt: "買いたい気持ちづくり",
    },
    {
      sender: "student",
      text: "どんな方法で信頼関係を築くんですか？",
    },
    {
      sender: "teacher",
      text: "信頼関係を築くためには、顧客の期待に応えるサービスを提供することが基本です。例えば、迅速な対応や丁寧なカスタマーサポート、品質の高い商品を提供することです。さらに、顧客のフィードバックを大切にし、それに基づいてサービスを改善していくことも重要です。",
    },
    { type: "sectionTitle", text: "デジタル時代のマーケティング" },
    {
      sender: "student",
      text: "デジタル化が進むと、マーケティングはどう変わりますか？",
    },
    {
      sender: "teacher",
      text: "デジタル化の進展により、企業の「売りたい気持ち」が消費者に見透かされるようになりました。これまで企業は「どう売るか」を主体に考えていましたが、今は消費者の「買いたい気持ち」を引き出すことがより重要になっています。",
    },
    {
      sender: "teacher",
      type: "image",
      src: marketing_3,
      alt: "デジタル化",
    },
    {
      sender: "student",
      text: "具体的にはどういうことですか？",
    },
    {
      sender: "teacher",
      text: "例えば、顧客の行動データを分析し、パーソナライズされた提案を行うことで、個々の顧客に合わせたアプローチをします。また、SNSを活用して顧客と直接コミュニケーションを取ったり、ユーザー生成コンテンツ（UGC）を利用して信頼性を高めたりする方法があります。",
    },
    {
      sender: "student",
      text: "なるほど、マーケティングの世界も変わってきているんですね。",
    },
    {
      sender: "teacher",
      text: "その通りです。企業の「売りたい気持ち」を消費者の「買いたい気持ち」に変えていくことが、現代のマーケティングの鍵です。",
    },
    { type: "sectionTitle", text: "マーケティングモデルと法則" },
    {
      sender: "student",
      text: "他にマーケティングのモデルとかってあるんですか？",
    },
    {
      sender: "teacher",
      text: "はい、マーケティングの基本的なモデルにはAIDMAとAISASがあります。",
    },
    {
      sender: "student",
      text: "それぞれどういうものですか？",
    },
    {
      sender: "teacher",
      text: "まず、AIDMAモデルについて説明します。AIDMAは以下の5つのステップで構成されています：\n1. Attention（注意）: 顧客の注意を引く。\n2. Interest（興味）: 顧客に興味を持たせる。\n3. Desire（欲求）: 商品やサービスへの欲求を喚起する。\n4. Memory（記憶）: 顧客の記憶に残る。\n5. Action（行動）: 実際に購入や行動を起こす。",
    },
    {
      sender: "student",
      text: "なるほど。AISASはどう違うんですか？",
    },
    {
      sender: "teacher",
      text: "AISASモデルは、デジタル時代に合わせて進化したマーケティングモデルです。以下の5つのステップからなります：\n1. Attention（注意）: 顧客の注意を引く。\n2. Interest（興味）: 顧客に興味を持たせる。\n3. Search（検索）: 顧客が情報を検索する。\n4. Action（行動）: 実際に購入や行動を起こす。\n5. Share（共有）: 購入後にSNSなどで体験を共有する。",
    },
    {
      sender: "teacher",
      type: "image",
      src: marketing_4,
      alt: "AIDMA/AISAS",
    },
    {
      sender: "student",
      text: "なるほど、マーケティングの世界も変わってきているんですね。他にマーケティングの重要な概念はありますか？",
    },
    {
      sender: "teacher",
      text: "はい、マーケティングファネルとパレートの法則が重要です。",
    },
    {
      sender: "student",
      text: "マーケティングファネルって何ですか？",
    },
    {
      sender: "teacher",
      text: "マーケティングファネルとは、顧客が商品を認知してから購入に至るまでの一連の段階を示すモデルです。以下の5つのステップで構成されています：\n1. 認知 (Attention): 顧客がCMや看板広告、ポスターなどで商品を認知する段階です。\n2. 興味 (Interest): 商品のことが気になり、商標に反応するようになる段階です。\n3. 欲求 (Desire): 顧客が商品を購入したいと思う段階です。\n4. 記憶 (Memory): 商品の良さや詳細を記憶する段階です。\n5. 行動 (Action): 実際に商品を購入する段階です。",
    },
    {
      sender: "teacher",
      type: "image",
      src: marketing_5,
      alt: "ファネル",
    },
    {
      sender: "student",
      text: "パレートの法則についても教えてください。",
    },
    {
      sender: "teacher",
      text: "パレートの法則とは、全体の結果の大部分が一部の要素によって生み出されるという現象を説明する法則です。マーケティングにおいては、顧客の2割が売上の8割を作るということを示しています。具体的には：\n1. 顧客の2割が、全体の売上の8割を占める。\n2. 残りの顧客の8割が、売上の2割を占める。",
    },
    {
      sender: "teacher",
      type: "image",
      src: marketing_6,
      alt: "パレートの法則",
    },
    {
      sender: "student",
      text: "なるほど、マーケティング戦略において、どの顧客にリソースを集中させるかが重要なんですね。",
    },
    {
      sender: "teacher",
      text: "その通りです。特に価値の高い顧客に対して重点的にアプローチすることで、効率的な売上向上が期待できます。",
    }
  ];

  const quizQuestions = [
    {
      question: "マーケティングの主な目的は何ですか？",
      options: [
        "製品を作ること",
        "顧客の「買いたい」気持ちを引き出すこと",
        "広告を作ること",
        "利益を最大化すること"
      ],
      correctAnswer: 1,
      explanation: "マーケティングの主な目的は、顧客の「買いたい」気持ちを引き出すことです。これにより、商品やサービスを継続的に売り続けるための仕組みを作ることができます。"
    },
    {
      question: "AISASモデルにおいて、最初の'S'が表すものは何ですか？",
      options: ["Search", "Share", "Sales", "Service"],
      correctAnswer: 0,
      explanation: "AISASモデルにおいて、最初の'S'は'Search'（検索）を表します。これは、顧客が興味を持った後に情報を検索する段階を示しています。"
    },
    {
      question: "パレートの法則では、顧客の何%が売上の80%を占めると言われていますか？",
      options: ["10%", "20%", "50%", "80%"],
      correctAnswer: 1,
      explanation: "パレートの法則では、顧客の20%が売上の80%を占めると言われています。これは「80:20の法則」とも呼ばれ、効率的なリソース配分の重要性を示しています。"
    },
    {
      question: "マーケティングファネルの最初のステージは何ですか？",
      options: ["Interest", "Desire", "Attention", "Action"],
      correctAnswer: 2,
      explanation: "マーケティングファネルの最初のステージは'Attention'（注意）です。この段階で、顧客の注意を引き、商品やサービスの存在を認知させることが目的となります。"
    }
  ];

  const showNextStep = () => {
    if (visibleStep < content.length - 1) {
      setVisibleStep(visibleStep + 1);
    } else {
      setQuizStarted(true);
    }
  };

  const handleQuizAnswer = (selectedAnswer) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeChapter(); // チャプター終了
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleStep]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const handleImageLoad = () => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      };

      chatContainer.addEventListener('load', handleImageLoad, true);

      return () => {
        chatContainer.removeEventListener('load', handleImageLoad, true);
      };
    }
  }, []);

  const progressPercentage = ((visibleStep + 1) / content.length) * 100;

  return (
    <div className="Content">
      <h1>「マーケティング」ってどう考えればいいの？</h1>
      
      {visibleStep === 0 && (
        <div className="chapter-overview">
          <h2>チャプター概要</h2>
          <p>{chapterOverview}</p>
        </div>
      )}
      
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      
      {!quizStarted ? (
        <>
          <div className="chat-container" ref={chatContainerRef}>
            {content.slice(0, visibleStep + 1).map((item, index) => (
              item.type === "sectionTitle" ? (
                <h3 key={index} className="section-title">{item.text}</h3>
              ) : (
                <div key={index} className={`chat-bubble ${item.sender}`}>
                  <img src={item.sender === "teacher" ? teacherIcon : studentIcon} alt={`${item.sender} icon`} className="icon" />
                  {item.type === "image" ? (
                    <img src={item.src} alt={item.alt} className="image" />
                  ) : (
                    <p>{item.text}</p>
                  )}
                </div>
              )
            ))}
          </div>
          <button onClick={showNextStep} className="next-button">
            {visibleStep < content.length - 1 ? "次へ" : "確認テストを始める"}
          </button>
        </>
      ) : (
        <div className="quiz-container">
          {currentQuestionIndex < quizQuestions.length ? (
            <>
              <h2>確認テスト</h2>
              <p>{quizQuestions[currentQuestionIndex].question}</p>
              {!showFeedback ? (
                quizQuestions[currentQuestionIndex].options.map((option, index) => (
                  <button key={index} onClick={() => handleQuizAnswer(index)} className="quiz-option">
                    {option}
                  </button>
                ))
              ) : (
                <div className="feedback">
                  <p>{isCorrect ? "正解です！" : "残念、不正解です。"}</p>
                  <p>{quizQuestions[currentQuestionIndex].explanation}</p>
                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button onClick={nextQuestion} className="next-button">次の問題へ</button>
                  ) : (
                    <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="next-button">結果を見る</button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <h2>テスト完了</h2>
              <p>あなたのスコア: {score}/{quizQuestions.length}</p>
              <p>お疲れ様でした！このテストを通じて、マーケティングの基本概念をより深く理解できたことを願っています。</p>
              <button onClick={completeChapter} className="next-button">チャプターを完了する</button>
            </>
          )}
        </div>
      )}
      
      <div className="links-container">
        <Link to="/">次の章へ</Link>
        <Link to="/">ホームに戻る</Link>  
      </div>
    </div>
  );
}

export default Page1;