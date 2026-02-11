import * as THREE from 'three';
import type { GameState, Direction, RouteOption } from '../types/index.ts';
import { GAME_CONFIG } from '../config/gameConfig.ts';
import { ScoreManager } from './ScoreManager.ts';
import { TimerManager } from './TimerManager.ts';
import { MapManager } from '../map/MapManager.ts';
import { PlayerCar } from '../vehicles/PlayerCar.ts';
import { NpcBuggy } from '../vehicles/NpcBuggy.ts';
import { InputHandler } from '../input/InputHandler.ts';
import { IntersectionJudge } from '../judge/IntersectionJudge.ts';
import { CameraController } from '../camera/CameraController.ts';
import { EffectManager } from '../ui/EffectManager.ts';
import { logger } from '../logger/Logger.ts';

export interface GameManagerCallbacks {
  onStateChange: (state: GameState) => void;
  onScoreChange: (score: number) => void;
  onTimerChange: (displayTime: string) => void;
  onApproachChange: (isApproaching: boolean, directions: Direction[], selected: Direction | null) => void;
}

const START_ROAD = 'ROAD_01';
const START_INTERSECTION = 'INT_03';
const NPC_START_PROGRESS = 0.3;
const PLAYER_START_PROGRESS = 0.0;

export class GameManager {
  private gameState: GameState = 'title';
  readonly scoreManager: ScoreManager;
  readonly timerManager: TimerManager;
  readonly mapManager: MapManager;
  readonly playerCar: PlayerCar;
  readonly npcBuggy: NpcBuggy;
  readonly inputHandler: InputHandler;
  readonly intersectionJudge: IntersectionJudge;
  readonly cameraController: CameraController;
  readonly effectManager: EffectManager;

  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer | null = null;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private callbacks: GameManagerCallbacks | null = null;

  private playerMesh: THREE.Group | null = null;
  private npcMesh: THREE.Group | null = null;

  constructor() {
    this.scoreManager = new ScoreManager();
    this.timerManager = new TimerManager();
    this.mapManager = new MapManager();
    this.playerCar = new PlayerCar();
    this.npcBuggy = new NpcBuggy();
    this.inputHandler = new InputHandler();
    this.intersectionJudge = new IntersectionJudge();
    this.cameraController = new CameraController();
    this.effectManager = new EffectManager();
    this.scene = new THREE.Scene();
  }

  initialize(
    canvas: HTMLCanvasElement,
    inputContainer: HTMLElement,
    effectContainer: HTMLElement,
    callbacks: GameManagerCallbacks,
  ): void {
    this.callbacks = callbacks;

    // レンダラー
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setClearColor(0x87CEEB);

    // カメラ
    this.cameraController.initialize(canvas.clientWidth / canvas.clientHeight);

    // マップ
    this.mapManager.initialize();
    this.buildMapScene();

    // 車両メッシュ
    this.playerMesh = this.createPlayerCarMesh();
    this.npcMesh = this.createNpcBuggyMesh();
    this.scene.add(this.playerMesh);
    this.scene.add(this.npcMesh);

    // ライト
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    this.scene.add(ambientLight);
    this.scene.add(directionalLight);

    // 入力
    this.inputHandler.initialize(inputContainer);
    this.effectManager.initialize(effectContainer);

    // タイマーコールバック
    this.timerManager.setOnTimeUp(() => this.endGame());

    logger.info('GameManager', 'ゲーム初期化完了');
    this.changeState('title');
  }

  startGame(): void {
    if (this.gameState !== 'title') {
      logger.warn('GameManager', '不正な状態遷移: startGame', { currentState: this.gameState });
      return;
    }

    this.scoreManager.reset();
    this.timerManager.reset();
    this.intersectionJudge.resetState();
    this.inputHandler.clearLastInput();
    this.inputHandler.enable();
    this.effectManager.clearAll();

    // 車両初期配置
    this.playerCar.reset(START_ROAD, PLAYER_START_PROGRESS, START_INTERSECTION);
    this.npcBuggy.reset(START_ROAD, NPC_START_PROGRESS, START_INTERSECTION);

    this.timerManager.start();
    this.changeState('playing');

    // ゲームループ開始
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);

    logger.info('GameManager', 'ゲーム開始');
  }

  endGame(): void {
    if (this.gameState !== 'playing') {
      logger.warn('GameManager', '不正な状態遷移: endGame', { currentState: this.gameState });
      return;
    }

    this.timerManager.stop();
    this.inputHandler.disable();
    this.scoreManager.updateHighScore();

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.changeState('gameover');
    logger.info('GameManager', 'ゲーム終了', { score: this.scoreManager.getCurrentScore() });
  }

  returnToTitle(): void {
    if (this.gameState !== 'gameover') {
      logger.warn('GameManager', '不正な状態遷移: returnToTitle', { currentState: this.gameState });
      return;
    }
    this.effectManager.clearAll();
    this.changeState('title');
  }

  getGameState(): GameState {
    return this.gameState;
  }

  private changeState(newState: GameState): void {
    this.gameState = newState;
    this.callbacks?.onStateChange(newState);
  }

  private gameLoop = (currentTime: number): void => {
    const rawDelta = (currentTime - this.lastTime) / 1000;
    const deltaTime = Math.min(Math.max(rawDelta, 0), GAME_CONFIG.MAX_DELTA_TIME);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // 1. タイマー更新
    this.timerManager.update(deltaTime);
    this.callbacks?.onTimerChange(this.timerManager.getDisplayTime());

    if (this.gameState !== 'playing') return;

    const playerRoad = this.mapManager.getRoad(this.playerCar.getCurrentRoadId());
    const npcRoad = this.mapManager.getRoad(this.npcBuggy.getCurrentRoadId());
    if (!playerRoad || !npcRoad) return;

    // 2. NPC 更新
    this.npcBuggy.update(deltaTime, npcRoad);

    // NPC が交差点に到達
    if (this.npcBuggy.hasReachedIntersection()) {
      this.handleNpcAtIntersection();
    }

    // 3. 交差点接近判定
    const dist = this.mapManager.getDistanceToIntersection(
      this.playerCar.getCurrentRoadId(),
      this.playerCar.getCurrentProgress(),
      this.playerCar.getTargetIntersectionId(),
    );
    this.intersectionJudge.update(dist, GAME_CONFIG.VEHICLE_SPEED);

    // 方向指示の更新
    if (this.intersectionJudge.getIsApproaching()) {
      const node = this.mapManager.getIntersection(this.playerCar.getTargetIntersectionId());
      if (node) {
        const dirs = node.getAvailableDirections(this.playerCar.getCurrentRoadId());
        this.intersectionJudge.setAvailableDirections(dirs);
      }
    }

    // 入力ロック
    if (this.intersectionJudge.getIsInputLocked()) {
      this.inputHandler.disable();
    }

    this.callbacks?.onApproachChange(
      this.intersectionJudge.getIsApproaching(),
      this.intersectionJudge.getAvailableDirections(),
      this.inputHandler.getLastInput()?.direction ?? null,
    );

    // 4. プレーヤー更新
    if (!this.playerCar.getIsSpinning()) {
      this.playerCar.update(deltaTime, playerRoad);
    } else {
      this.playerCar.update(deltaTime, playerRoad); // スピンアニメーション更新
    }

    // プレーヤーが交差点に到達
    if (this.playerCar.hasReachedIntersection() && !this.playerCar.getIsSpinning()) {
      this.handlePlayerAtIntersection();
    }

    // 5. メッシュ同期
    this.syncMeshes();

    // 6. カメラ更新
    this.cameraController.update(this.playerCar.getPosition(), this.playerCar.getRotation());

    // 7. エフェクト更新
    this.effectManager.update(deltaTime);

    // 8. レンダリング
    if (this.renderer) {
      this.renderer.render(this.scene, this.cameraController.getCamera());
    }
  }

  private handleNpcAtIntersection(): void {
    const node = this.mapManager.getIntersection(this.npcBuggy.getTargetIntersectionId());
    if (!node) return;

    const dirs = node.getAvailableDirections(this.npcBuggy.getCurrentRoadId());
    if (dirs.length === 0) return;

    const chosenDir = this.npcBuggy.decideDirection(dirs);
    const route = node.getRoute(this.npcBuggy.getCurrentRoadId(), chosenDir);
    if (route) {
      const road = this.mapManager.getRoad(route.roadId);
      if (road) this.npcBuggy.enterRoad(road, route.nextIntersectionId);
    }
  }

  private handlePlayerAtIntersection(): void {
    const npcDirection = this.npcBuggy.getChosenDirection();
    if (!npcDirection) {
      // NPC が方向を決めていない → 直進で正解扱い
      this.movePlayerForward();
      return;
    }

    const result = this.intersectionJudge.judge(
      this.inputHandler.getLastInput(),
      npcDirection,
      this.playerCar.getTargetIntersectionId(),
    );

    if (result.isCorrect) {
      this.scoreManager.addScore();
      this.effectManager.playCorrectEffect();
      this.callbacks?.onScoreChange(this.scoreManager.getCurrentScore());
      logger.info('GameManager', '正解', { intersection: result.intersectionId, score: this.scoreManager.getCurrentScore() });
    } else {
      this.playerCar.startSpin();
      logger.info('GameManager', '不正解', { intersection: result.intersectionId, player: result.playerDirection, correct: result.correctDirection });
    }

    // 正解ルートに進む
    this.movePlayerToCorrectRoute(npcDirection);

    this.inputHandler.clearLastInput();
    this.inputHandler.enable();
    this.intersectionJudge.resetState();
  }

  private movePlayerToCorrectRoute(correctDirection: Direction): void {
    const node = this.mapManager.getIntersection(this.playerCar.getTargetIntersectionId());
    if (!node) return;
    const route = node.getRoute(this.playerCar.getCurrentRoadId(), correctDirection);
    if (route) {
      const road = this.mapManager.getRoad(route.roadId);
      if (road) this.playerCar.enterRoad(road, route.nextIntersectionId);
    }
  }

  private movePlayerForward(): void {
    const node = this.mapManager.getIntersection(this.playerCar.getTargetIntersectionId());
    if (!node) return;
    const dirs = node.getAvailableDirections(this.playerCar.getCurrentRoadId());
    const dir: Direction = dirs.includes('straight') ? 'straight' : dirs[0];
    const route: RouteOption | undefined = node.getRoute(this.playerCar.getCurrentRoadId(), dir);
    if (route) {
      const road = this.mapManager.getRoad(route.roadId);
      if (road) this.playerCar.enterRoad(road, route.nextIntersectionId);
    }
    this.inputHandler.clearLastInput();
    this.intersectionJudge.resetState();
  }

  private syncMeshes(): void {
    if (this.playerMesh) {
      const pos = this.playerCar.getPosition();
      this.playerMesh.position.set(pos.x, pos.y + 0.5, pos.z);
      this.playerMesh.rotation.y = this.playerCar.getRotation();
      this.playerMesh.rotation.z = this.playerCar.getZRotation();
    }
    if (this.npcMesh) {
      const pos = this.npcBuggy.getPosition();
      this.npcMesh.position.set(pos.x, pos.y + 0.5, pos.z);
      this.npcMesh.rotation.y = this.npcBuggy.getRotation();
    }
  }

  private createPlayerCarMesh(): THREE.Group {
    const group = new THREE.Group();
    // 車体
    const bodyGeo = new THREE.BoxGeometry(2, 1, 3);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    group.add(body);

    // 屋根
    const roofGeo = new THREE.BoxGeometry(1.6, 0.6, 1.8);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x1565C0 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 1.3;
    group.add(roof);

    // 警告灯
    const lightGeo = new THREE.BoxGeometry(1.2, 0.3, 0.3);
    const lightMat = new THREE.MeshLambertMaterial({ color: 0xF44336 });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.y = 1.75;
    group.add(light);

    // タイヤ
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const positions = [[-1, 0.3, -1], [1, 0.3, -1], [-1, 0.3, 1], [1, 0.3, 1]];
    for (const [wx, wy, wz] of positions) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      group.add(wheel);
    }

    return group;
  }

  private createNpcBuggyMesh(): THREE.Group {
    const group = new THREE.Group();
    // 車体
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.8, 2.5);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xF44336 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    group.add(body);

    // フロントガード
    const guardGeo = new THREE.BoxGeometry(1.8, 0.4, 0.3);
    const guardMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.set(0, 0.3, 1.4);
    group.add(guard);

    // タイヤ
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 8);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const positions = [[-1, 0.35, -0.8], [1, 0.35, -0.8], [-1, 0.35, 0.8], [1, 0.35, 0.8]];
    for (const [wx, wy, wz] of positions) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      group.add(wheel);
    }

    return group;
  }

  private buildMapScene(): void {
    // 地面
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    this.scene.add(ground);

    // 道路の描画
    for (const road of this.mapManager.getAllRoads()) {
      const start = road.getPositionAtProgress(0);
      const end = road.getPositionAtProgress(1);

      const dx = end.x - start.x;
      const dz = end.z - start.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);

      const roadGeo = new THREE.PlaneGeometry(5, len);
      const roadMat = new THREE.MeshLambertMaterial({ color: 0x616161 });
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.rotation.z = -angle;
      roadMesh.position.set(
        (start.x + end.x) / 2,
        0,
        (start.z + end.z) / 2,
      );
      this.scene.add(roadMesh);
    }

    // 交差点の広場
    for (const node of this.mapManager.getAllIntersections()) {
      const intGeo = new THREE.PlaneGeometry(6, 6);
      const intMat = new THREE.MeshLambertMaterial({ color: 0x757575 });
      const intMesh = new THREE.Mesh(intGeo, intMat);
      intMesh.rotation.x = -Math.PI / 2;
      intMesh.position.set(node.position.x, 0.01, node.position.z);
      this.scene.add(intMesh);

      // ランドマーク
      if (node.landmark) {
        this.addLandmark(node.position, node.landmark);
      }
    }
  }

  private addLandmark(position: { x: number; z: number }, landmark: string): void {
    let color = 0x888888;
    let height = 8;

    switch (landmark) {
      case 'lookoutTower':
        color = 0x1565C0;
        height = 16;
        break;
      case 'cityHall':
        color = 0x8D6E63;
        height = 10;
        break;
      case 'farm':
        color = 0x795548;
        height = 6;
        break;
      case 'beach':
        color = 0xFFEB3B;
        height = 3;
        break;
      case 'lighthouse':
        color = 0xF5F5F5;
        height = 12;
        break;
      case 'playground':
        color = 0xFF9800;
        height = 5;
        break;
      case 'museum':
        color = 0x9E9E9E;
        height = 8;
        break;
      case 'racetrack':
        color = 0x212121;
        height = 2;
        break;
    }

    const geo = new THREE.BoxGeometry(6, height, 6);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(position.x + 8, height / 2, position.z + 8);
    this.scene.add(mesh);
  }

  onResize(width: number, height: number): void {
    this.cameraController.onResize(width, height);
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }

  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.inputHandler.dispose();
    this.effectManager.dispose();
    this.renderer?.dispose();
  }
}
