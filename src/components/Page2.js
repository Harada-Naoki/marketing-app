import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../utils/apiRequest';
import '../App.css';
import ChatBubble from '../components/ChatBubble';
import QuizQuestion from '../components/QuizQuestion';
import { BookOpen } from 'lucide-react';

const CHAPTERS_COUNT = 2;
const chapterData = Array.from({ length: CHAPTERS_COUNT }, (_, i) => require(`../data/chapter2/chapter2_${i + 1}.js`));

function Page2() {
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
  const [inactiveStartTime, setInactiveStartTime] = useState(null);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  const chatContainerRef = useRef(null);
  const inactivityTimer = useRef(null);

  const isValidChapter = chapterIndex >= 0 && chapterIndex < CHAPTERS_COUNT;
  const chapter = isValidChapter ? chapterData[chapterIndex] : null;

  const saveStudyTime = useCallback(async (time) => {
    try {
      await apiRequest('/api/progress/update', {
        method: 'POST',
        data: {
          chapterId: chapterId,
          studyTime: time
        }
      });
    } catch (error) {
      console.error('Error saving study time', error);
    }
  }, [chapterId]);

  const completeChapter = useCallback(async () => {
    try {
      const endTime = Date.now();
      const elapsed = Math.floor((endTime - startTime) / 1000);
      const totalStudyTime = studyTime + elapsed;
      await saveStudyTime(totalStudyTime);

      await apiRequest('/api/progress/update', {
        method: 'POST',
        data: {
          chapterId: chapterId,
          completed: true,
          studyTime: totalStudyTime
        }
      });

      if (chapterIndex < CHAPTERS_COUNT - 1) {
        const nextChapterId = `1_${chapterIndex + 2}`;
        navigate(`/marketing-app/Page1/${nextChapterId}`);
        window.location.reload();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error completing chapter', error);
    }
  }, [chapterId, chapterIndex, navigate, saveStudyTime, startTime, studyTime]);

  useEffect(() => {
    if (!isValidChapter) {
      navigate('/');
      return;
    }

    const handleInactivity = () => {
      setInactiveStartTime(Date.now());
    };

    const resetInactivityTimer = () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      inactivityTimer.current = setTimeout(handleInactivity, 180000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleInactivity();
      } else {
        handleActivityResume();
      }
    };

    const handleActivityResume = () => {
      if (inactiveStartTime) {
        const inactiveEndTime = Date.now();
        const inactiveDuration = Math.floor((inactiveEndTime - inactiveStartTime) / 1000);
        setInactiveStartTime(null);
        setStartTime(prevTime => prevTime + inactiveDuration * 1000);
      }
      setStartTime(Date.now());
      resetInactivityTimer();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleActivityResume);
    window.addEventListener('blur', handleInactivity);
    ['mousemove', 'keydown', 'touchstart', 'touchmove'].forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleActivityResume);
      window.removeEventListener('blur', handleInactivity);
      ['mousemove', 'keydown', 'touchstart', 'touchmove'].forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });

      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      const endTime = Date.now();
      const elapsed = Math.floor((endTime - startTime) / 1000);
      saveStudyTime(studyTime + elapsed);
    };
  }, [isValidChapter, navigate, startTime, studyTime, inactiveStartTime, saveStudyTime]);

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

  if (!isValidChapter) return null;

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
        <div className="chat-content">
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
      </div>

      {!quizStarted && (
        <div className="next-button-container">
          <button onClick={showNextStep} className="next-button">
            {visibleStep < content.length - 1 ? "次へ" : "確認テストを始める"}
          </button>
        </div>
      )}

      <div className="links-container">
        {/* {chapterIndex < CHAPTERS_COUNT - 1 && (
          <Link to={`/marketing-app/Page1/1_${chapterIndex + 2}`}>次の章へ</Link>
        )} */}
        <Link to="/">ホームに戻る</Link>  
      </div>
    </div>
  );
}

export default Page2;