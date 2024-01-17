import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState(0);

  const handlePreviousClick = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const handleNextClick = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="App">
      {currentPage === 0 && (
        <header className="App-header">
          <p>여기에 앱의 첫 번째 내용이 들어갑니다.</p>
          <div className="button-container">
            <button onClick={handleNextClick}>다음</button>
          </div>
        </header>
      )}

      {currentPage === 1 && (
        <div className="App-header">
          <div className="button-container">
            <button onClick={handlePreviousClick}>이전</button>
            <button onClick={handleNextClick}>다음</button>
          </div>
          <p>다음 화면입니다</p>
        </div>
      )}

      {currentPage === 2 && (
        <div className="App-header">
          <p>마지막 화면입니다.</p>
          <div className="button-container">
            <button onClick={handlePreviousClick}>이전</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;