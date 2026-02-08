import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from './Logger.ts';

describe('Logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('ログフォーマット検証', () => {
    it('LG-001: INFO ログのフォーマット', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = new Logger('development');
      logger.info('GameEngine', 'ゲーム開始', { score: 0 });

      expect(spy).toHaveBeenCalledOnce();
      const output = spy.mock.calls[0][0] as string;
      expect(output).toMatch(/^\[.+\+09:00\] \[INFO\] \[GameEngine\] ゲーム開始 \{"score":0\}$/);
    });

    it('LG-002: context なしのログ', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = new Logger('development');
      logger.info('API', 'リクエスト受信');

      const output = spy.mock.calls[0][0] as string;
      expect(output).not.toContain('{');
    });

    it('LG-003: タイムスタンプが JST', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = new Logger('development');
      logger.info('Test', 'test');

      const output = spy.mock.calls[0][0] as string;
      expect(output).toContain('+09:00');
    });
  });

  describe('ログレベルフィルタ', () => {
    it('LG-010: development で DEBUG が出力される', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const logger = new Logger('development');
      logger.debug('Test', 'debug message');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('LG-011: production で DEBUG が出力されない', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const logger = new Logger('production');
      logger.debug('Test', 'debug message');
      expect(spy).not.toHaveBeenCalled();
    });

    it('LG-012: production で INFO が出力される', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = new Logger('production');
      logger.info('Test', 'info message');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('LG-013: staging で DEBUG が出力されない', () => {
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const logger = new Logger('staging');
      logger.debug('Test', 'debug message');
      expect(spy).not.toHaveBeenCalled();
    });

    it('LG-014: staging で INFO が出力される', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = new Logger('staging');
      logger.info('Test', 'info message');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('LG-015: 全環境で ERROR が出力される', () => {
      for (const env of ['development', 'staging', 'production'] as const) {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const logger = new Logger(env);
        logger.error('Test', 'error message');
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      }
    });

    it('LG-016: 全環境で FATAL が出力される', () => {
      for (const env of ['development', 'staging', 'production'] as const) {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const logger = new Logger(env);
        logger.fatal('Test', 'fatal message');
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      }
    });
  });

  describe('レベル優先度', () => {
    it('LG-020: DEBUG < INFO < WARN < ERROR < FATAL の順序', () => {
      const logger = new Logger('production');
      // production ではINFO以上が出力される
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logger.debug('T', 'm');
      logger.info('T', 'm');
      logger.warn('T', 'm');
      logger.error('T', 'm');
      logger.fatal('T', 'm');

      expect(debugSpy).not.toHaveBeenCalled(); // DEBUG はフィルタ
      expect(infoSpy).toHaveBeenCalledOnce();  // INFO は出力
      expect(warnSpy).toHaveBeenCalledOnce();  // WARN は出力
      expect(errorSpy).toHaveBeenCalledTimes(2); // ERROR + FATAL
    });
  });
});
