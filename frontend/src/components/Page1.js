import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../utils/apiRequest';
import '../App.css';
import ChatBubble from '../components/ChatBubble';
import QuizQuestion from '../components/QuizQuestion';
import { BookOpen } from 'lucide-react';

const CHAPTERS_COUNT = 40;
const chapterData = Array.from({ length: CHAPTERS_COUNT }, (_, i) => require(`../data/chapter1/chapter1_${i + 1}.js`));

function Page1() {
  const { chapterId } = useParams();
  const chapterIndex = parseInt(chapterId.split('_')[1], 10) - 1;
  const navigate = useNavigate();

  const [visibleStep, setVisibleStep] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const chatContainerRef = useRef(null);
  const [showOverview, setShowOverview] = useState(false);

  const isValidChapter = chapterIndex >= 0 && chapterIndex < CHAPTERS_COUNT;
  const chapter = isValidChapter ? chapterData[chapterIndex] : null;

  const startTimeRef = useRef(Date.now());
  
  const saveProgress = useCallback(async (options = {}) => {
    const { updateStartTime = false } = options;

    try {
      const endTime = Date.now();
      let elapsed = Math.floor((endTime - startTimeRef.current) / 1000);

      if (elapsed > 60) {
        elapsed = 60;
      }

      const totalStudyTime = studyTime + elapsed;

      await apiRequest('/api/progress/update', {
        method: 'POST',
        data: {
          chapterId: chapterId,
          visibleStep: visibleStep,
          quizStarted: quizStarted,
          currentQuestionIndex: currentQuestionIndex,
          score: score,
          studyTime: totalStudyTime,
          completed: options.completed || false,
        },
      });

      if (updateStartTime) {
        startTimeRef.current = Date.now();
      }
    } catch (error) {
      console.error('Error saving progress', error);
    }
  }, [chapterId, visibleStep, quizStarted, currentQuestionIndex, score, studyTime]);
  

  const completeChapter = useCallback(async () => {
    try {
      await saveProgress({ completed: true });
      setShowResults(true);  
    } catch (error) {
      console.error('Error completing chapter', error);
    }
  }, [saveProgress]);

  const navigateToNextChapter = useCallback(() => {
    const nextChapterId = `1_${chapterIndex + 2}`;
    if (chapterIndex < CHAPTERS_COUNT - 1) {
      navigate(`/marketing-app/Page1/${nextChapterId}`);
    } else {
      navigate('/marketing-app');
    }
  }, [chapterIndex, navigate]);

  const navigateToHome = useCallback(() => {
    navigate('/marketing-app');
  }, [navigate]);

  //  チャプター遷移時に経過時間リセット
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [chapterId]);
  
  // チャプターが変わった後、スクロール位置を最上部へ
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      });
    });
  }, [chapterId]);
  

  useEffect(() => {
    let cancelled = false;
  
    const fetch = async () => {
      const response = await apiRequest(`/api/progress/${chapterId}`, {
        method: 'GET',
      });
  
      if (cancelled) return;
  
      if (response.data) {
        if (response.data.visibleStep !== visibleStep) setVisibleStep(response.data.visibleStep ?? 0);
        if (response.data.quizStarted !== quizStarted) setQuizStarted(response.data.quizStarted);
        if (response.data.currentQuestionIndex !== currentQuestionIndex) setCurrentQuestionIndex(response.data.currentQuestionIndex);
        if (response.data.score !== score) setScore(response.data.score);
        if (response.data.studyTime !== studyTime) setStudyTime(response.data.studyTime);
        setShowResults(response.data.completed);
      } else {
        // 初期化処理
        setVisibleStep(0);
        setQuizStarted(false);
        setCurrentQuestionIndex(0);
        setScore(0);
        setStudyTime(0);
        setShowResults(false);
      }
  
      setIsLoading(false);
      await saveProgress({ updateStartTime: true });
    };
  
    fetch();
  
    return () => {
      cancelled = true;
    };
  }, [chapterId]); 
  
  useEffect(() => {
    if (!isValidChapter) {
      navigate('/marketing-app');
      return;
    }
  
    const handleInactivity = () => {
      saveProgress({ updateStartTime: false });
    };
  
    const handleActivityResume = () => {
      setStartTime(Date.now());
    };
  
    const handlePageHide = (event) => {
      const data = JSON.stringify({
        chapterId: chapterId,
        visibleStep: visibleStep,
        quizStarted: quizStarted,
        currentQuestionIndex: currentQuestionIndex,
        score: score,
        studyTime: studyTime,
        completed: false,
      });
  
      const url = '/api/progress/update';
      
      navigator.sendBeacon(url, data);
    };
  
    const handlePopState = () => {
      saveProgress({ updateStartTime: false });
    };
  
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleInactivity();
      } else {
        handleActivityResume();
      }
    };
  
    const intervalId = setInterval(() => {
      saveProgress({ updateStartTime: false });
    }, 5000); 
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleActivityResume);
    window.addEventListener('blur', handleInactivity);
    window.addEventListener('pagehide', handlePageHide); 
    window.addEventListener('popstate', handlePopState); 
  
    return () => {
      clearInterval(intervalId); 
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleActivityResume);
      window.removeEventListener('blur', handleInactivity);
      window.removeEventListener('pagehide', handlePageHide); 
      window.removeEventListener('popstate', handlePopState); 
    };
  }, [isValidChapter, saveProgress, navigate, chapterId, visibleStep, quizStarted, currentQuestionIndex, score, studyTime]);
  
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [visibleStep, quizStarted, currentQuestionIndex, showFeedback, showResults, allImagesLoaded]);

  useEffect(() => {
    const images = chatContainerRef.current?.getElementsByTagName('img');
    if (!images) return;

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
      Array.from(images).forEach(img => {
        if (img.complete) {
          handleImageLoad();
        } else {
          img.addEventListener('load', handleImageLoad);
          img.addEventListener('error', handleImageLoad);
        }
      });
    }

    return () => {
      Array.from(images).forEach(img => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageLoad);
      });
    };
  }, [visibleStep, quizStarted, currentQuestionIndex]);

  const showNextStep = useCallback(() => {
    if (visibleStep < chapter.content.length - 1) {
      setVisibleStep(prev => prev + 1); 
      setAllImagesLoaded(false); 
    } else {
      setQuizStarted(true); 
      setShowFeedback(false); 
    }
  }, [visibleStep, chapter]);
  
  const handleQuizAnswer = useCallback((selectedAnswer) => {
    const currentQuestion = chapter.quizQuestions[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      setScore(prev => prev + 1);
    }
  }, [chapter, currentQuestionIndex]);
  
  const nextQuestion = useCallback(() => {
    setShowFeedback(false);
    if (currentQuestionIndex < chapter.quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1); 
    } else {
      setShowResults(true); 
    }
  }, [currentQuestionIndex, chapter]);
  
  const resetQuiz = useCallback(async () => {
    try {
      setScore(0);
      setCurrentQuestionIndex(0);
      setShowFeedback(false);
      setShowResults(false);
      
    } catch (error) {
      console.error('Error resetting quiz', error);
    }
  }, [saveProgress]);
  
  if (!isValidChapter) return null;
  if (isLoading) return <div>Loading...</div>;

  const { title, chapterOverview, content, quizQuestions } = chapter;
  const progressPercentage = ((visibleStep + 1) / content.length) * 100;

  return (
    <div className="Content">
      <div className="chapter-header">
        <div className="title-container">
          <BookOpen className="book-icon" size={50} />
          <h1 className="main-title">{title}</h1>
        </div>
        <>
          {visibleStep === 0 && (
            <div className="overview-container">
              <h2 className="overview-title">チャプター概要</h2>
              <p className="overview-text">{chapterOverview}</p>
            </div>
            )}
            {visibleStep > 0 && (
              <>
                <button onClick={() => setShowOverview(!showOverview)}>
                {showOverview ? '概要を閉じる' : '概要を見る'}
                </button>
                {showOverview && (
                <div className="overview-container">
                  <h2 className="overview-title">チャプター概要</h2>
                  <p className="overview-text">{chapterOverview}</p>
                </div>
                )}
            </>
            )}
        </>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>

      <div className="chat-container" ref={chatContainerRef}>
        <div className="chat-content">
          {content.slice(0, visibleStep + 1).map((item, index) => (
            <div key={index}>
              {item.type === "sectionTitle" ? (
                <h3 className="section-title">{item.text}</h3>
              ) : (
                <ChatBubble
                sender={item.sender}
                type={item.type}
                text={item.text}
                src={item.src}
                alt={item.alt}
                tableData={item.tableData}  
              />
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
              navigateToNextChapter={navigateToNextChapter}
              navigateToHome={navigateToHome}
              resetQuiz={resetQuiz} 
            />
          )}
        </div>
      </div>

      {!quizStarted && (
        <div className="next-button-container">
          <button onClick={showNextStep} className="next-button">
            {visibleStep < content.length - 1 ? "次へ" : "確認テストを始める"}
          </button>
        </div>
      )}

      {!showResults && (
        <div className="links-container">
          <Link 
          to="/marketing" 
          onClick={() => saveProgress({ updateStartTime: false })}
          >
            ホームに戻る
          </Link>
        </div>
      )}
    </div>
  );
}

export default Page1;