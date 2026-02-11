import { useState, useRef, useEffect, useCallback } from 'react';
import type { GameState, Direction } from './types/index.ts';
import { GameManager } from './core/GameManager.ts';
import { TitleScene } from './scenes/TitleScene.tsx';
import { GameOverScene } from './scenes/GameOverScene.tsx';
import { HudRenderer } from './ui/HudRenderer.tsx';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [score, setScore] = useState(0);
  const [displayTime, setDisplayTime] = useState('01:00');
  const [isApproaching, setIsApproaching] = useState(false);
  const [availableDirections, setAvailableDirections] = useState<Direction[]>([]);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<HTMLDivElement>(null);
  const gmRef = useRef<GameManager | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !effectRef.current) return;

    const gm = new GameManager();
    gmRef.current = gm;

    gm.initialize(canvasRef.current, containerRef.current, effectRef.current, {
      onStateChange: setGameState,
      onScoreChange: setScore,
      onTimerChange: setDisplayTime,
      onApproachChange: (approaching, dirs, selected) => {
        setIsApproaching(approaching);
        setAvailableDirections(dirs);
        setSelectedDirection(selected);
      },
    });

    const handleResize = () => {
      gm.onResize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      gm.dispose();
    };
  }, []);

  const handleStart = useCallback(() => {
    gmRef.current?.startGame();
  }, []);

  const handleRetry = useCallback(() => {
    gmRef.current?.returnToTitle();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        touchAction: 'none',
      }}
    >
      {/* Three.js キャンバス */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none',
          display: gameState === 'playing' ? 'block' : 'none',
        }}
      />

      {/* エフェクトレイヤー */}
      <div
        ref={effectRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 50,
          display: gameState === 'playing' ? 'block' : 'none',
        }}
      />

      {/* 画面遷移 */}
      {gameState === 'title' && (
        <TitleScene onStart={handleStart} />
      )}

      {gameState === 'playing' && (
        <HudRenderer
          displayTime={displayTime}
          score={score}
          isApproaching={isApproaching}
          availableDirections={availableDirections}
          selectedDirection={selectedDirection}
        />
      )}

      {gameState === 'gameover' && (
        <GameOverScene
          score={score}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
