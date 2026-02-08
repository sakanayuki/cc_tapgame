import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameManager } from './GameManager.ts';

// Three.js のモック (jsdom にWebGL がないため)
vi.mock('three', () => {
  class Vector3Mock {
    x = 0; y = 0; z = 0;
    set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; return this; }
  }
  class Object3DMock {
    position = new Vector3Mock();
    rotation = { x: 0, y: 0, z: 0 };
    add() {}
    children: unknown[] = [];
  }
  class MeshMock extends Object3DMock {}
  class GroupMock extends Object3DMock {}
  class SceneMock extends Object3DMock {}
  class PerspectiveCameraMock extends Object3DMock {
    aspect = 1;
    updateProjectionMatrix() {}
    lookAt() {}
  }
  return {
    Scene: SceneMock,
    PerspectiveCamera: PerspectiveCameraMock,
    WebGLRenderer: class {
      setPixelRatio() {}
      setSize() {}
      setClearColor() {}
      render() {}
      dispose() {}
    },
    AmbientLight: Object3DMock,
    DirectionalLight: Object3DMock,
    BoxGeometry: class {},
    PlaneGeometry: class {},
    CylinderGeometry: class {},
    MeshLambertMaterial: class {},
    Mesh: MeshMock,
    Group: GroupMock,
    Vector3: Vector3Mock,
  };
});

describe('GameManager (統合テスト)', () => {
  let gm: GameManager;

  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.clear();
    gm = new GameManager();
  });

  describe('状態遷移', () => {
    it('GM-001: 初期状態', () => {
      expect(gm.getGameState()).toBe('title');
    });

    it('GM-002: タイトル → プレイ', () => {
      gm.startGame();
      expect(gm.getGameState()).toBe('playing');
    });

    it('GM-003: プレイ → ゲームオーバー', () => {
      gm.startGame();
      gm.endGame();
      expect(gm.getGameState()).toBe('gameover');
    });

    it('GM-004: ゲームオーバー → タイトル', () => {
      gm.startGame();
      gm.endGame();
      gm.returnToTitle();
      expect(gm.getGameState()).toBe('title');
    });
  });

  describe('不正な状態遷移', () => {
    it('GM-010: タイトルから endGame', () => {
      gm.endGame();
      expect(gm.getGameState()).toBe('title');
    });

    it('GM-011: プレイ中に startGame', () => {
      gm.startGame();
      gm.startGame();
      expect(gm.getGameState()).toBe('playing');
    });

    it('GM-012: ゲームオーバーから endGame', () => {
      gm.startGame();
      gm.endGame();
      gm.endGame();
      expect(gm.getGameState()).toBe('gameover');
    });
  });

  describe('ゲーム開始時の初期化', () => {
    it('GM-020: スコアリセット', () => {
      gm.scoreManager.addScore();
      gm.startGame();
      expect(gm.scoreManager.getCurrentScore()).toBe(0);
    });

    it('GM-021: タイマーリセット', () => {
      gm.startGame();
      expect(gm.timerManager.getRemainingTime()).toBe(60.0);
    });

    it('GM-022: 入力クリア', () => {
      gm.startGame();
      expect(gm.inputHandler.getLastInput()).toBeNull();
    });
  });
});
