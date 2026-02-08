import { GAME_CONFIG } from '../config/gameConfig.ts';

interface Effect {
  type: 'star' | 'text';
  elapsed: number;
  duration: number;
  element: HTMLElement;
  angle?: number;
  speed?: number;
}

export class EffectManager {
  private activeEffects: Effect[] = [];
  private container: HTMLElement | null = null;

  initialize(container: HTMLElement): void {
    this.container = container;
  }

  playCorrectEffect(): void {
    if (!this.container) return;

    // 星エフェクト
    for (let i = 0; i < GAME_CONFIG.STAR_EFFECT_COUNT; i++) {
      const el = document.createElement('div');
      el.className = 'effect-star';
      el.textContent = '\u2B50';
      el.style.position = 'absolute';
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.fontSize = '16px';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '100';
      this.container.appendChild(el);

      this.activeEffects.push({
        type: 'star',
        elapsed: 0,
        duration: GAME_CONFIG.CORRECT_EFFECT_DURATION_SEC,
        element: el,
        angle: (i / GAME_CONFIG.STAR_EFFECT_COUNT) * Math.PI * 2,
        speed: 120 + Math.random() * 60,
      });
    }

    // テキストエフェクト
    const textEl = document.createElement('div');
    textEl.className = 'effect-text';
    textEl.textContent = 'Great!';
    textEl.style.position = 'absolute';
    textEl.style.left = '50%';
    textEl.style.top = '40%';
    textEl.style.transform = 'translate(-50%, -50%)';
    textEl.style.fontSize = '32px';
    textEl.style.fontWeight = 'bold';
    textEl.style.color = '#FFD700';
    textEl.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    textEl.style.pointerEvents = 'none';
    textEl.style.zIndex = '101';
    this.container.appendChild(textEl);

    this.activeEffects.push({
      type: 'text',
      elapsed: 0,
      duration: GAME_CONFIG.CORRECT_EFFECT_DURATION_SEC,
      element: textEl,
    });
  }

  update(deltaTime: number): void {
    const toRemove: number[] = [];

    for (let i = 0; i < this.activeEffects.length; i++) {
      const effect = this.activeEffects[i];
      effect.elapsed += deltaTime;

      if (effect.elapsed >= effect.duration) {
        toRemove.push(i);
        continue;
      }

      const progress = effect.elapsed / effect.duration;

      if (effect.type === 'star' && effect.angle !== undefined && effect.speed !== undefined) {
        const dist = effect.speed * progress;
        const x = Math.cos(effect.angle) * dist;
        const y = Math.sin(effect.angle) * dist;
        const opacity = 1 - progress;
        effect.element.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        effect.element.style.opacity = String(opacity);
      } else if (effect.type === 'text') {
        const scale = 1 + progress * 0.3;
        const opacity = 1 - progress;
        effect.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
        effect.element.style.opacity = String(opacity);
      }
    }

    // 逆順で削除
    for (let i = toRemove.length - 1; i >= 0; i--) {
      const idx = toRemove[i];
      const effect = this.activeEffects[idx];
      effect.element.remove();
      this.activeEffects.splice(idx, 1);
    }
  }

  getActiveEffectCount(): number {
    return this.activeEffects.length;
  }

  clearAll(): void {
    for (const effect of this.activeEffects) {
      effect.element.remove();
    }
    this.activeEffects = [];
  }

  dispose(): void {
    this.clearAll();
    this.container = null;
  }
}
