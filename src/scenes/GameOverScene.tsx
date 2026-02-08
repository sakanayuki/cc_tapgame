import { SCORE_MESSAGES } from '../config/gameConfig.ts';

interface GameOverSceneProps {
  score: number;
  onRetry: () => void;
}

function getScoreMessage(score: number): string {
  for (const entry of SCORE_MESSAGES) {
    if (entry.maxScore === null || score < entry.maxScore) {
      return entry.message;
    }
  }
  return SCORE_MESSAGES[SCORE_MESSAGES.length - 1].message;
}

export function GameOverScene({ score, onRetry }: GameOverSceneProps) {
  const message = getScoreMessage(score);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #0d47a1 0%, #42a5f5 100%)',
    }}>
      <div style={{
        fontSize: 18,
        color: '#B3E5FC',
        marginBottom: 8,
      }}>
        SCORE
      </div>

      <div data-testid="final-score" style={{
        fontSize: 64,
        fontWeight: 'bold',
        color: '#FFD600',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        fontFamily: 'monospace',
        marginBottom: 24,
      }}>
        {score}
      </div>

      <div data-testid="score-message" style={{
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
        textAlign: 'center',
        padding: '0 24px',
        marginBottom: 48,
      }}>
        {message}
      </div>

      <button
        data-testid="retry-button"
        onClick={onRetry}
        style={{
          padding: '16px 48px',
          fontSize: 22,
          fontWeight: 'bold',
          color: '#fff',
          background: '#F44336',
          border: 'none',
          borderRadius: 30,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          pointerEvents: 'auto',
        }}
      >
        RETRY
      </button>
    </div>
  );
}
