import React, { useState, useEffect } from "react";
import "./App.css";

function Square({ value, onSquareClick, isWinningSquare }) {
  return (
    <label className={`square ${isWinningSquare ? "winning-square" : ""}`} onClick={onSquareClick}>
      {value}
    </label>
  );
}

function ResetBtn({ resetGame }) {
  return (
    <button className="setting-btn" onClick={resetGame}>
      Reset
    </button>
  );
}

function Settings({ resetGame, setDifficulty, multiplayer, toggleMultiplayer, difficulty }) {
  const [showHardMode, setShowHardMode] = useState(true);

  useEffect(() => {
    if (multiplayer) {
      setShowHardMode(false);
      setDifficulty("normal"); // Ensure difficulty is set to normal in multiplayer mode
    } else {
      setShowHardMode(true);
    }
  }, [multiplayer, setDifficulty]);

  function toggleHardMode() {
    setDifficulty(difficulty === "normal" ? "hard" : "normal");
  }

  function handleMultiplayerToggle() {
    toggleMultiplayer(!multiplayer);
    setShowHardMode(!multiplayer); // Toggle the visibility of the hard mode button
    setDifficulty("normal"); // Reset difficulty to normal when toggling multiplayer mode
  }

  return (
    <div className="settings">
      <div className="settings-title">
        <h4>SETTINGS</h4>
      </div>
      <div className="settings-btn-container">
        <button className="setting-btn" onClick={handleMultiplayerToggle}>
          {multiplayer ? "Single player" : "Multiplayer"}
        </button>
        <ResetBtn resetGame={resetGame} />
        <button
          className={`setting-btn ${showHardMode && difficulty === "hard" ? "hard-mode" : ""}`}
          onClick={toggleHardMode}
          style={{ display: multiplayer ? "none" : "inline-block" }} // Hide hard mode button in multiplayer mode
        >
          {difficulty === "hard" ? "Hard" : "Normal"}
        </button>
      </div>
    </div>
  );
}

export default function BoardGame() {
  const [values, setValues] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [multiplayer, setMultiplayer] = useState(false);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [difficulty, setDifficulty] = useState("normal");
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [winningLine, setWinningLine] = useState([]);

  // Computer's turn (O's turn)
  useEffect(() => {
    if (!isXNext && !multiplayer && isComputerTurn && !calculateWinner(values).winner) {
      const timer = setTimeout(() => {
        let index;
        if (difficulty === "hard") {
          // Hard mode logic
          index = getHardModeMove(values);
        } else {
          index = getRandomEmptySquareIndex(values);
        }
        if (index !== -1) {
          const newValues = [...values];
          newValues[index] = "O";
          setValues(newValues);
          setIsXNext(true);
          setIsComputerTurn(false);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isXNext, isComputerTurn, multiplayer, values, difficulty]);

  // Player's turn (X's turn)
  function handleClick(i) {
    if (values[i] || calculateWinner(values).winner || (!isXNext && !multiplayer && isComputerTurn)) return;
    const newValues = values.slice();
    newValues[i] = isXNext ? "X" : "O";
    setValues(newValues);
    setIsXNext(!isXNext);
    if (!multiplayer) setIsComputerTurn(true);
  }

  const { winner, line } = calculateWinner(values);
  let status = winner ? winner : `${isXNext ? "X" : "O"} Turn!`;

  function resetGame() {
    setValues(Array(9).fill(null));
    setIsXNext(true);
    setIsComputerTurn(false);
    setWinningLine([]);
  }

  useEffect(() => {
    if (multiplayer || !multiplayer || difficulty !== "normal") {
      resetGame();
      setScores({ X: 0, O: 0 });
    }
  }, [multiplayer, difficulty]);

  useEffect(() => {
    if (winner && winner !== "It's a draw!") {
      setScores((prevScores) => {
        const winnerKey = winner.includes("X") ? "X" : "O";
        return { ...prevScores, [winnerKey]: prevScores[winnerKey] + 1 };
      });
      setWinningLine(line);
      setTimeout(() => {
        resetGame();
      }, 1500); // Delay before resetting the game
    } else if (winner === "It's a draw!") {
      setTimeout(() => {
        resetGame();
      }, 1500); // Delay before resetting the game
    }
  }, [winner]);

  return (
    <div className="board-game">
      <div className="status">{status}</div>
      <div className="scoreboard">
        <span className="score">X SCORE - {scores.X}</span>
        <span className="score">O SCORE - {scores.O}</span>
      </div>
      <div className="square-container-border">
        <div className="square-container">
          {Array(9)
            .fill()
            .map((_, i) => (
              <Square key={i} value={values[i]} onSquareClick={() => handleClick(i)} isWinningSquare={winningLine.includes(i)} />
            ))}
        </div>
      </div>
      <Settings resetGame={resetGame} setDifficulty={setDifficulty} multiplayer={multiplayer} toggleMultiplayer={setMultiplayer} difficulty={difficulty} />
    </div>
  );
}

function getRandomEmptySquareIndex(values) {
  const emptyIndices = [];
  values.forEach((value, index) => {
    if (value === null) {
      emptyIndices.push(index);
    }
  });
  return emptyIndices.length > 0 ? emptyIndices[Math.floor(Math.random() * emptyIndices.length)] : -1;
}

function calculateWinner(values) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (values[a] && values[a] === values[b] && values[a] === values[c]) {
      return { winner: `Player ${values[a]} wins!`, line: [a, b, c] };
    } else if (!values.includes(null) && i === lines.length - 1) {
      return { winner: "It's a draw!", line: [] };
    }
  }
  return { winner: null, line: [] };
}

function getHardModeMove(values) {
  // Check if the computer can win in the next move and win
  for (let i = 0; i < values.length; i++) {
    if (values[i] === null) {
      const newValues = [...values];
      newValues[i] = "O";
      if (calculateWinner(newValues).winner) {
        return i;
      }
    }
  }

  // Check if the player is about to win and block the player
  for (let i = 0; i < values.length; i++) {
    if (values[i] === null) {
      const newValues = [...values];
      newValues[i] = "X";
      if (calculateWinner(newValues).winner) {
        return i;
      }
    }
  }

  // If neither condition is met, choose a random empty square
  return getRandomEmptySquareIndex(values);
}
