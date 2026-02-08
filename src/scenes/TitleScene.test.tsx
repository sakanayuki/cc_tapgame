import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TitleScene } from './TitleScene.tsx';

describe('TitleScene', () => {
  it('TS-001: ロゴが表示される', () => {
    render(<TitleScene onStart={() => {}} />);
    expect(screen.getByTestId('logo')).toBeDefined();
  });

  it('TS-002: スタートボタンが表示される', () => {
    render(<TitleScene onStart={() => {}} />);
    expect(screen.getByTestId('start-button')).toBeDefined();
  });

  it('TS-003: スタートボタン押下で遷移', () => {
    const onStart = vi.fn();
    render(<TitleScene onStart={onStart} />);
    fireEvent.click(screen.getByTestId('start-button'));
    expect(onStart).toHaveBeenCalledOnce();
  });
});
