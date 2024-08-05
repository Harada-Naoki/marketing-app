import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../utils/apiRequest';
import '../App.css';
import ChatBubble from '../components/ChatBubble';
import QuizQuestion from '../components/QuizQuestion';
import { BookOpen } from 'lucide-react';

// フックの前にチャプターデータをロード
const chapterData = Array.from({ length: 20 }, (_, i) => require(`../data/chapter1_${i + 1}.js`));

function Page1() {
  const { chapterId } = useParams();
  const chapterIndex = parseInt(chapterId, 10) - 1;
  const navigate = useNavigate();

  const [visibleStep, setVisibleStep] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const chatContainerRef = useRef(null);
  const [studyTime, setStudyTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  // チャプターデータの有効性チェック
  const isValidChapter = chapterIndex >= 0 && chapterIndex < chapterData.length;
  const chapter = isValidChapter ? chapterData[chapterIndex] : null;

  const saveStudyTime = async (time) => {
    try {
      await apiRequest('/api/progress/update', {
        method: 'POST',
        data: {
          chapterId: `1_${chapterId}`,
          studyTime: time
        }
      });
    } catch (error) {
      console.error('Error saving study time', error);
    }
  };

  useEffect(() => {
    if (!isValidChapter) {
      // 無効なチャプターIDの場合、ホームページにリダイレクト
      navigate('/');
      return;
    }

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
  }, [isValidChapter, navigate, startTime, studyTime, chapterId]);

  // コンテンツが追加されるたびに最下部にスクロール
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleStep, quizStarted, currentQuestionIndex, showFeedback, showResults, allImagesLoaded]);

  // 画像の読み込み完了を監視
  useEffect(() => {
    const images = chatContainerRef.current?.getElementsByTagName('img');
    if (images) {
      let loadedCount = 0;
      const totalImages = images.length;

      const handleImageLoad = () => {
        loadedCount += 1;
        if (loadedCount === totalImages) {
          setAllImagesLoaded(true);
        }
      };

      if (totalImages === 0) {
        setAllImagesLoaded(true);
      } else {
        for (const img of images) {
          if (img.complete) {
            handleImageLoad();
          } else {
            img.addEventListener('load', handleImageLoad);
            img.addEventListener('error', handleImageLoad);
          }
        }
      }

      return () => {
        for (const img of images) {
          img.removeEventListener('load', handleImageLoad);
          img.removeEventListener('error', handleImageLoad);
        }
      };
    }
  }, [visibleStep, quizStarted, currentQuestionIndex]);

  const completeChapter = async () => {
    try {
      const endTime = Date.now();
      const elapsed = Math.floor((endTime - startTime) / 1000);
      const totalStudyTime = studyTime + elapsed;
      await saveStudyTime(totalStudyTime);

      await apiRequest('/api/progress/update', {
          method: 'POST',
          data: {
              chapterId: `1_${chapterId}`,
              completed: true,
              studyTime: totalStudyTime
          }
      });

      navigate('/');
    } catch (error) {
      console.error('Error completing chapter', error);
    }
  };

  const showNextStep = () => {
    if (visibleStep < chapter.content.length - 1) {
      setVisibleStep(visibleStep + 1);
      setAllImagesLoaded(false); // 新しいステップが追加されるたびにリセット
    } else {
      setQuizStarted(true);
    }
  };

  const handleQuizAnswer = (selectedAnswer) => {
    const currentQuestion = chapter.quizQuestions[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < chapter.quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true); // クイズ終了後の結果表示状態に変更
    }
  };

  if (!isValidChapter) {
    return null; // または適切なローディング表示
  }

  const { title, chapterOverview, content, quizQuestions } = chapter;
  const progressPercentage = ((visibleStep + 1) / content.length) * 100;

  return (
    <div className="Content">
      <div className="chapter-header">
        <div className="title-container">
          <BookOpen className="book-icon" size={50} />
          <h1 className="main-title">{title}</h1>
        </div>
      
        {visibleStep === 0 && (
          <div className="overview-container">
            <h2 className="overview-title">チャプター概要</h2>
            <p className="overview-text">{chapterOverview}</p>
          </div>
        )}
      </div>
      
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      
      <div className="chat-container" ref={chatContainerRef}>
        {content.slice(0, visibleStep + 1).map((item, index) => (
          <div key={index}>
            {item.type === "sectionTitle" ? (
              <h3 className="section-title">{item.text}</h3>
            ) : (
              <ChatBubble sender={item.sender} type={item.type} text={item.text} src={item.src} alt={item.alt} />
            )}
          </div>
        ))}

        {quizStarted && (
          <QuizQuestion
            question={quizQuestions[currentQuestionIndex]?.question}
            options={quizQuestions[currentQuestionIndex]?.options}
            handleAnswer={handleQuizAnswer}
            showFeedback={showFeedback}
            isCorrect={isCorrect}
            explanation={quizQuestions[currentQuestionIndex]?.explanation}
            nextQuestion={nextQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={quizQuestions.length}
            score={score}
            completeChapter={completeChapter}
            showResults={showResults}
            setShowResults={setShowResults}
          />
        )}
      </div>

      {!quizStarted && (
        <button onClick={showNextStep} className="next-button">
          {visibleStep < content.length - 1 ? "次へ" : "確認テストを始める"}
        </button>
      )}
      
      <div className="links-container">
        <Link to={`/marketing-app/Page1/${parseInt(chapterId) + 1}`}>次の章へ</Link>
        <Link to="/">ホームに戻る</Link>  
      </div>
    </div>
  );
}

export default Page1;
