import { useEffect, useState } from 'react';
import type { Direction } from '../types/index.ts';
import { GAME_CONFIG } from '../config/gameConfig.ts';

interface HudProps {
  displayTime: string;
  score: number;
  isApproaching: boolean;
  availableDirections: Direction[];
  selectedDirection: Direction | null;
}

const DIRECTION_ICONS: Record<Direction, string> = {
  left: '\u2B05\uFE0F',
  straight: '\u2B06\uFE0F',
  right: '\u27A1\uFE0F',
};

export function HudRenderer({
  displayTime,
  score,
  isApproaching,
  availableDirections,
  selectedDirection,
}: HudProps) {
  const [blinkVisible, setBlinkVisible] = useState(true);

  useEffect(() => {
    if (!isApproaching) {
      setBlinkVisible(true);
      return;
    }
    const interval = setInterval(() => {
      setBlinkVisible(v => !v);
    }, GAME_CONFIG.BLINK_INTERVAL_SEC * 1000);
    return () => clearInterval(interval);
  }, [isApproaching]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      {/* タイマー */}
      <div data-testid="timer" style={{
        position: 'absolute',
        top: 12,
        left: 16,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        fontFamily: 'monospace',
      }}>
        {displayTime}
      </div>

      {/* スコア */}
      <div data-testid="score" style={{
        position: 'absolute',
        top: 12,
        right: 16,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        fontFamily: 'monospace',
      }}>
        {score}
      </div>

      {/* 方向指示アイコン */}
      {isApproaching && (
        <div data-testid="direction-icons" style={{
          position: 'absolute',
          bottom: '20%',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          opacity: blinkVisible ? 1 : 0.2,
          transition: 'opacity 0.1s',
        }}>
          {(['left', 'straight', 'right'] as Direction[]).map(dir => {
            if (!availableDirections.includes(dir)) return null;
            const isSelected = selectedDirection === dir;
            return (
              <span
                key={dir}
                data-testid={`direction-${dir}`}
                className={isSelected ? 'direction-highlight' : ''}
                style={{
                  fontSize: 40,
                  filter: isSelected ? 'brightness(1.5) drop-shadow(0 0 8px gold)' : 'none',
                }}
              >
                {DIRECTION_ICONS[dir]}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
