import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [playerY, setPlayerY] = useState(270);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(8);
  const [score, setScore] = useState(0);
  const [canJump, setCanJump] = useState(true); // Состояние для ограничения прыжков

  const gameAreaHeight = 300;
  const gameAreaWidth = 800;
  const playerSize = 30;
  const gravity = 1;
  const jumpStrength = -20;
  const obstacleGap = 200;

  const handleKeyDown = (event) => {
    if (event.code === 'Space' && !gameOver && canJump) { // Игрок может прыгать только если есть возможность
      setVelocity(jumpStrength);
      setCanJump(false); // Запрещаем следующий прыжок, пока не приземлимся
    }
  };

  // Создаем препятствия с более коротким интервалом
  useEffect(() => {
    const intervalId = setInterval(() => {
      setObstacles((obs) => {
        if (obs.length === 0 || obs[obs.length - 1].x < gameAreaWidth - obstacleGap) {
          return [
            ...obs,
            { x: gameAreaWidth, width: 30, height: 50 + Math.random() * 50 },
          ];
        }
        return obs;
      });
    }, 1000); // Уменьшаем интервал до 1 секунды

    return () => clearInterval(intervalId);
  }, []);

  // Двигаем препятствия
  useEffect(() => {
    const intervalId = setInterval(() => {
      setObstacles((obs) =>
        obs
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - speed }))
          .filter((obstacle) => obstacle.x + 30 > 0)
      );
    }, 50);

    return () => clearInterval(intervalId);
  }, [speed]);

  // Движение игрока
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlayerY((y) => Math.min(gameAreaHeight - playerSize, y + velocity));
      setVelocity((v) => v + gravity);
    }, 30);

    return () => clearInterval(intervalId);
  }, [velocity]);

  // Проверка на столкновения, увеличение счета и проверка на приземление
  useEffect(() => {
    if (playerY >= gameAreaHeight - playerSize) {
      setPlayerY(gameAreaHeight - playerSize); // Приземляем игрока
      setVelocity(0); // Обнуляем скорость после приземления
      setCanJump(true); // Разрешаем следующий прыжок
    }

    obstacles.forEach((obstacle) => {
      if (
        obstacle.x < 50 + playerSize &&
        obstacle.x + obstacle.width > 50 &&
        playerY + playerSize > gameAreaHeight - obstacle.height
      ) {
        setGameOver(true);
      }

      // Увеличиваем счет, если игрок проходит препятствие
      if (!obstacle.passed && obstacle.x + obstacle.width < 50 && !gameOver) {
        setScore((prevScore) => prevScore + 1); // Увеличиваем счет только если игра не завершена
        obstacle.passed = true; // Фиксируем, что препятствие прошло
      }
    });
  }, [obstacles, playerY, gameOver]);

  // Добавляем обработчик событий клавиатуры
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameOver, canJump]);

  if (gameOver) {
    return <h1 style={{ color: 'red' }}>Game Over! Score: {score}</h1>;
  }

  return (
    <div
      className="game-area"
      style={{
        width: gameAreaWidth,
        height: gameAreaHeight,
        position: 'relative',
        backgroundColor: 'black', // Черный фон для области игры
      }}
    >
      {/* Отображаем счет */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          fontSize: '20px',
          color: 'green', // Пурпурный цвет для счета
        }}
      >
        Score: {score}
      </div>

      {/* Игрок */}
      <div
        className="player"
        style={{
          position: 'absolute',
          top: playerY,
          left: 50,
          width: playerSize,
          height: playerSize,
          backgroundColor: 'violet', // Фиолетовый игрок
        }}
      />

      {/* Препятствия */}
      {obstacles.map((obstacle, index) => (
        <svg
          key={index}
          className="obstacle"
          style={{
            position: 'absolute',
            bottom: 0,
            left: obstacle.x,
            width: obstacle.width,
            height: obstacle.height,
          }}
        >
          <polygon
            points={`0,${obstacle.height} ${obstacle.width / 2},0 ${obstacle.width},${obstacle.height}`}
            fill="red" // Красные препятствия
          />
        </svg>
      ))}
    </div>
  );
};

export default App;
