import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HudRenderer } from './HudRenderer.tsx';

describe('HudRenderer', () => {
  it('HU-001: タイマー表示', () => {
    render(
      <HudRenderer
        displayTime="00:45"
        score={0}
        isApproaching={false}
        availableDirections={[]}
        selectedDirection={null}
      />,
    );
    expect(screen.getByTestId('timer')).toHaveTextContent('00:45');
  });

  it('HU-002: スコア表示', () => {
    render(
      <HudRenderer
        displayTime="00:45"
        score={8}
        isApproaching={false}
        availableDirections={[]}
        selectedDirection={null}
      />,
    );
    expect(screen.getByTestId('score')).toHaveTextContent('8');
  });

  it('HU-003: 方向指示アイコン非表示', () => {
    render(
      <HudRenderer
        displayTime="00:45"
        score={0}
        isApproaching={false}
        availableDirections={['left', 'straight', 'right']}
        selectedDirection={null}
      />,
    );
    expect(screen.queryByTestId('direction-icons')).toBeNull();
  });

  it('HU-004: 方向指示アイコン表示 (十字路)', () => {
    render(
      <HudRenderer
        displayTime="00:45"
        score={0}
        isApproaching={true}
        availableDirections={['left', 'straight', 'right']}
        selectedDirection={null}
      />,
    );
    expect(screen.getByTestId('direction-left')).toBeDefined();
    expect(screen.getByTestId('direction-straight')).toBeDefined();
    expect(screen.getByTestId('direction-right')).toBeDefined();
  });

  it('HU-005: 方向指示アイコン表示 (T字路)', () => {
    render(
      <HudRenderer
        displayTime="00:45"
        score={0}
        isApproaching={true}
        availableDirections={['left', 'right']}
        selectedDirection={null}
      />,
    );
    expect(screen.getByTestId('direction-left')).toBeDefined();
    expect(screen.queryByTestId('direction-straight')).toBeNull();
    expect(screen.getByTestId('direction-right')).toBeDefined();
  });

  it('HU-006: 選択方向のハイライト', () => {
    render(
      <HudRenderer
        displayTime="00:45"
        score={0}
        isApproaching={true}
        availableDirections={['left', 'straight', 'right']}
        selectedDirection="left"
      />,
    );
    const leftIcon = screen.getByTestId('direction-left');
    expect(leftIcon.className).toContain('direction-highlight');
  });

  it('HU-007: 選択なし', () => {
    render(
      <HudRenderer
        displayTime="00:45"
        score={0}
        isApproaching={true}
        availableDirections={['left', 'straight', 'right']}
        selectedDirection={null}
      />,
    );
    const leftIcon = screen.getByTestId('direction-left');
    expect(leftIcon.className).not.toContain('direction-highlight');
  });
});
