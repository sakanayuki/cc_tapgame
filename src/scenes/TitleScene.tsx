interface TitleSceneProps {
  onStart: () => void;
}

export function TitleScene({ onStart }: TitleSceneProps) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #1a237e 0%, #4fc3f7 100%)',
      position: 'relative',
    }}>
      {/* ロゴ */}
      <div data-testid="logo" style={{
        marginBottom: 48,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="ゲームロゴ">
          {/* バッジ形状 */}
          <polygon
            points="70,5 95,25 115,15 110,45 135,55 115,75 125,105 95,100 70,130 45,100 15,105 25,75 5,55 30,45 25,15 45,25"
            fill="#1565C0"
            stroke="#FFD600"
            strokeWidth="3"
          />
          {/* パトカーモチーフ */}
          <rect x="45" y="50" width="50" height="30" rx="8" fill="#FFFFFF" />
          <rect x="55" y="42" width="30" height="12" rx="4" fill="#E3F2FD" />
          {/* 警告灯 */}
          <circle cx="60" cy="42" r="5" fill="#F44336" />
          <circle cx="80" cy="42" r="5" fill="#2196F3" />
          {/* タイヤ */}
          <circle cx="55" cy="82" r="6" fill="#333" />
          <circle cx="85" cy="82" r="6" fill="#333" />
        </svg>
        <div style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#FFD600',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          marginTop: 12,
          fontFamily: 'sans-serif',
          letterSpacing: 2,
        }}>
          PAW CHASE
        </div>
        <div style={{
          fontSize: 14,
          color: '#B3E5FC',
          marginTop: 4,
        }}>
          Adventure Bay Racing
        </div>
      </div>

      {/* スタートボタン */}
      <button
        data-testid="start-button"
        onClick={onStart}
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
        START
      </button>
    </div>
  );
}
