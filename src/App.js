import React, {useState} from 'react';
import Board from './Board';
import './App.css';

function App() {
  const [cellSize, setCellSize] = useState(20);
  let handleCellChange = (event) => {
    setCellSize(event.target.value);
  }
  return (
    <div className="App">
      <Board cellSize={cellSize}/>
      <div>
          Cell Size:
          <input value={cellSize} onChange={handleCellChange}>
          </input>
      </div>
    </div>
  );
}

export default App;
