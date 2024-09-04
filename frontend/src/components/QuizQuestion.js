import React, { useCallback } from 'react';

const QuizQuestion = ({ question, options, handleAnswer, showFeedback, isCorrect, explanation, nextQuestion, currentQuestionIndex, totalQuestions, score, completeChapter, showResults, setShowResults, navigateToNextChapter, navigateToHome, resetQuiz }) => {
  
  const handleCompleteAndNavigateToNextChapter = useCallback(async () => {
    await completeChapter(); // 完了をマークする
    navigateToNextChapter(); // 次のチャプターへ進む
  }, [completeChapter, navigateToNextChapter]);

  const handleCompleteAndNavigateToHome = useCallback(async () => {
    await completeChapter(); // 完了をマークする
    navigateToHome(); // ホームに戻る
  }, [completeChapter, navigateToHome]);

  const handleResetQuiz = useCallback(async () => {
    await resetQuiz(); // クイズをリセット
  }, [resetQuiz]);

  return (
    <div className="quiz-container">
      {showResults ? (
        <>
          <h2>テスト完了</h2>
          <p><span>あなたのスコア: {score}/{totalQuestions}</span></p>
          <p>お疲れ様でした！このテストを通じて、マーケティングの基本概念をより深く理解できたことを願っています。</p>
          <div className="quiz-completion-buttons">
            <button onClick={handleCompleteAndNavigateToNextChapter} className="next-button">次のチャプターへ進む</button>
            <button onClick={handleCompleteAndNavigateToHome} className="next-button">ホームに戻る</button>
            <button onClick={handleResetQuiz} className="next-button">もう一度テストを実施する</button>
          </div>
        </>
      ) : (
        <>
          <h2>確認テスト</h2>
          <p>{question}</p>
          {!showFeedback ? (
            options.map((option, index) => (
              <button key={index} onClick={() => handleAnswer(index)} className="quiz-option">
                {option}
              </button>
            ))
          ) : (
            <div className="feedback">
              <p className={isCorrect ? 'correct' : 'incorrect'}>
                {isCorrect ? "正解です！" : "残念、不正解です。"}
              </p>
              <p>{explanation}</p>
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button onClick={nextQuestion} className="next-button">次の問題へ</button>
              ) : (
                <button onClick={() => setShowResults(true)} className="next-button">結果を見る</button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default QuizQuestion;
