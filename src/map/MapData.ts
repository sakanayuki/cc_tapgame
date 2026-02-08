import type { IntersectionDefinition, RoadDefinition } from '../types/index.ts';

export const INTERSECTION_DEFINITIONS: readonly IntersectionDefinition[] = [
  { id: 'INT_01', position: { x: 0,   y: 0, z: -80 }, type: 't-junction',  landmark: 'lookoutTower' },
  { id: 'INT_02', position: { x: -40, y: 0, z: -60 }, type: 'cross',       landmark: 'farm' },
  { id: 'INT_03', position: { x: 40,  y: 0, z: -60 }, type: 'cross',       landmark: 'cityHall' },
  { id: 'INT_04', position: { x: -60, y: 0, z: -20 }, type: 't-junction',  landmark: null },
  { id: 'INT_05', position: { x: 60,  y: 0, z: -20 }, type: 't-junction',  landmark: 'beach' },
  { id: 'INT_06', position: { x: -40, y: 0, z: 0 },   type: 'cross',       landmark: 'playground' },
  { id: 'INT_07', position: { x: 40,  y: 0, z: 0 },   type: 'cross',       landmark: null },
  { id: 'INT_08', position: { x: -60, y: 0, z: 40 },  type: 't-junction',  landmark: 'museum' },
  { id: 'INT_09', position: { x: 60,  y: 0, z: 40 },  type: 't-junction',  landmark: 'lighthouse' },
  { id: 'INT_10', position: { x: 0,   y: 0, z: 60 },  type: 't-junction',  landmark: 'racetrack' },
];

export const ROAD_DEFINITIONS: readonly RoadDefinition[] = [
  // 外周ループ
  { id: 'ROAD_01', start: 'INT_01', end: 'INT_03' },
  { id: 'ROAD_02', start: 'INT_03', end: 'INT_05' },
  { id: 'ROAD_03', start: 'INT_05', end: 'INT_07' },
  { id: 'ROAD_04', start: 'INT_07', end: 'INT_09' },
  { id: 'ROAD_05', start: 'INT_09', end: 'INT_10' },
  { id: 'ROAD_06', start: 'INT_10', end: 'INT_08' },
  { id: 'ROAD_07', start: 'INT_08', end: 'INT_04' },
  { id: 'ROAD_08', start: 'INT_04', end: 'INT_06' },
  { id: 'ROAD_09', start: 'INT_06', end: 'INT_02' },
  { id: 'ROAD_10', start: 'INT_02', end: 'INT_01' },
  // 内部道路
  { id: 'ROAD_11', start: 'INT_02', end: 'INT_03' },
  { id: 'ROAD_12', start: 'INT_06', end: 'INT_07' },
  { id: 'ROAD_13', start: 'INT_08', end: 'INT_09' },
];
