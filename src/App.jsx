import './App.css';
import './index.css';
import React, { useCallback, useEffect, useState } from 'react';

const generateInitialGrid = () => {
  const grid = Array(4)
    .fill(null)
    .map(() => Array(4).fill(null));

  for (let i = 0; i < 2; i++) {
    const emptyCells = grid
      .flatMap((row, rowIndex) =>
        row.map((cell, cellIndex) =>
          cell === null ? { rowIndex, cellIndex } : null,
        ),
      )
      .filter((cell) => cell !== null);

    if (emptyCells.length > 0) {
      const { rowIndex, cellIndex } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[rowIndex][cellIndex] = 2;
    }
  }
  return grid;
};

const addRandomCell = (grid) => {
  const emptyCells = grid
    .flatMap((row, rowIndex) =>
      row.map((cell, cellIndex) =>
        cell === null ? { rowIndex, cellIndex } : null,
      ),
    )
    .filter((cell) => cell !== null);

  if (emptyCells.length > 0) {
    const { rowIndex, cellIndex } =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[rowIndex][cellIndex] = Math.random() < 0.9 ? 2 : 4;
  }

  return grid;
};

const Board = ({ grid }) => {
  return (
    <div className="board">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={`cell ${getStyleByValue(cell)}`}>
              {cell !== 0 && cell !== null ? cell : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const getStyleByValue = (value) => {
  const styles = {
    2: 'cell-2',
    4: 'cell-4',
    8: 'cell-8',
    16: 'cell-16',
    32: 'cell-32',
    64: 'cell-64',
    128: 'cell-128',
  };
  return styles[value] || 'cell-default';
};

const Game = () => {
  const [grid, setGrid] = useState(generateInitialGrid());
  const [gameOver, setGameOver] = useState(false);

  const handleKeyPress = useCallback(
    (event) => {
      if (gameOver) return;

      let direction = null;
      switch (event.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        default:
          return;
      }

      if (direction) {
        const { result, isMoved } = moveMapIn2048Rule(grid, direction);
        if (isMoved) {
          const newGrid = addRandomCell(result);
          setGrid(newGrid);
        }

        if (result.flat().includes(128)) {
          setGameOver(true);
        }
      }
    },
    [grid, gameOver],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="game-container">
      <h1 className="title">128</h1>
      <div className="sub-title"> Join the tiles, get to 128! </div>
      <Board grid={grid} />
      {gameOver && <h2 className="game-over">Game Over!</h2>}
    </div>
  );
};

const moveMapIn2048Rule = (map, direction) => {
  const rotatedMap = rotateMapCounterClockwise(map, rotateDegreeMap[direction]);
  const { result, isMoved } = moveLeft(rotatedMap);
  return {
    result: rotateMapCounterClockwise(result, revertDegreeMap[direction]),
    isMoved,
  };
};

const rotateDegreeMap = {
  up: 90,
  right: 180,
  down: 270,
  left: 0,
};

const revertDegreeMap = {
  up: 270,
  right: 180,
  down: 90,
  left: 0,
};

const rotateMapCounterClockwise = (map, degree) => {
  const rowLength = map.length;
  const columnLength = map[0]?.length || 0;

  if (columnLength === 0 || rowLength === 0) {
    return map;
  }

  switch (degree) {
    case 0:
      return map;
    case 90:
      return Array.from({ length: columnLength }, (_, columnIndex) =>
        Array.from(
          { length: rowLength },
          (_, rowIndex) =>
            map[rowIndex]?.[columnLength - columnIndex - 1] || null,
        ),
      );
    case 180:
      return Array.from({ length: rowLength }, (_, rowIndex) =>
        Array.from(
          { length: columnLength },
          (_, columnIndex) =>
            map[rowLength - rowIndex - 1]?.[columnLength - columnIndex - 1] ||
            null,
        ),
      );
    case 270:
      return Array.from({ length: columnLength }, (_, columnIndex) =>
        Array.from(
          { length: rowLength },
          (_, rowIndex) => map[rowLength - rowIndex - 1]?.[columnIndex] || null,
        ),
      );
    default:
      return map;
  }
};

const moveLeft = (map) => {
  const movedRows = map.map(moveRowLeft);
  const result = movedRows.map((movedRow) => movedRow.result);
  const isMoved = movedRows.some((movedRow) => movedRow.isMoved);
  return { result, isMoved };
};

const moveRowLeft = (row) => {
  const reduced = row.reduce(
    (acc, cell) => {
      if (cell === null) {
        return acc;
      } else if (acc.lastCell === null) {
        return { ...acc, lastCell: cell };
      } else if (acc.lastCell === cell) {
        return { result: [...acc.result, cell * 2], lastCell: null };
      } else {
        return { result: [...acc.result, acc.lastCell], lastCell: cell };
      }
    },
    { lastCell: null, result: [] },
  );

  const result = [...reduced.result, reduced.lastCell];
  const resultRow = Array.from(
    { length: row.length },
    (_, i) => result[i] || null,
  );

  return {
    result: resultRow,
    isMoved: row.some((cell, i) => cell !== resultRow[i]),
  };
};

export default Game;
