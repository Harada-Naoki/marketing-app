import React from 'react';

const QuizQuestion = ({ question, options, handleAnswer, showFeedback, isCorrect, explanation, nextQuestion, currentQuestionIndex, totalQuestions, score, completeChapter, showResults, setShowResults }) => (
  <div className="quiz-container">
    {showResults ? (
      <>
        <h2>テスト完了</h2>
        <p><span>あなたのスコア: {score}/{totalQuestions}</span></p>
        <p>お疲れ様でした！このテストを通じて、マーケティングの基本概念をより深く理解できたことを願っています。</p>
        <button onClick={completeChapter} className="next-button">チャプターを完了する</button>
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
            <p><span>{isCorrect ? "正解です！" : "残念、不正解です。"}</span></p>
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

export default QuizQuestion;
