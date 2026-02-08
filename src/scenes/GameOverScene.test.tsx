import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameOverScene } from './GameOverScene.tsx';

describe('GameOverScene', () => {
  it('GO-001: スコア表示', () => {
    render(<GameOverScene score={15} onRetry={() => {}} />);
    expect(screen.getByTestId('final-score')).toHaveTextContent('15');
  });

  it('GO-002: メッセージ表示 (0〜9点)', () => {
    render(<GameOverScene score={5} onRetry={() => {}} />);
    expect(screen.getByTestId('score-message')).toHaveTextContent('よく頑張ったね！');
  });

  it('GO-003: メッセージ表示 (10〜19点)', () => {
    render(<GameOverScene score={10} onRetry={() => {}} />);
    expect(screen.getByTestId('score-message')).toHaveTextContent('すごいすごい！！');
  });

  it('GO-004: メッセージ表示 (20点以上)', () => {
    render(<GameOverScene score={25} onRetry={() => {}} />);
    expect(screen.getByTestId('score-message')).toHaveTextContent('キミもパウパトロールにならない？！！');
  });

  it('GO-005: リトライボタン押下', () => {
    const onRetry = vi.fn();
    render(<GameOverScene score={0} onRetry={onRetry} />);
    fireEvent.click(screen.getByTestId('retry-button'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
