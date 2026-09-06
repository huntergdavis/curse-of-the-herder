export const Terrain = {
  Water: 0,
  Sand: 1,
  Grass: 2,
  Meadow: 3,
  Farm: 4,
  Forest: 5,
  Mud: 6,
  Rock: 7,
  Snow: 8,
  Road: 9,
  Bridge: 10,
} as const;
export type TerrainId = (typeof Terrain)[keyof typeof Terrain];
export const TERRAIN_COUNT = 11;

/** Movement cost per tile for pathfinding; Infinity is impassable. */
export const TERRAIN_COST: readonly number[] = [
  Infinity, // water
  1.3, // sand
  1.0, // grass
  1.0, // meadow
  1.4, // farm
  1.6, // forest
  2.6, // mud
  2.4, // rock
  Infinity, // snow
  0.7, // road
  0.7, // bridge
];

/** Speed multiplier while walking on a tile (base speed is in the sim). */
export const TERRAIN_SPEED: readonly number[] = [
  0, // water
  0.8, // sand
  1.0, // grass
  1.0, // meadow
  0.72, // farm
  0.62, // forest
  0.4, // mud
  0.42, // rock
  0, // snow
  1.35, // road
  1.35, // bridge
];

/** Draw order for the blob autotiler: later entries encroach on earlier. */
export const TERRAIN_LAYER_ORDER: readonly TerrainId[] = [
  Terrain.Water,
  Terrain.Sand,
  Terrain.Mud,
  Terrain.Grass,
  Terrain.Meadow,
  Terrain.Farm,
  Terrain.Forest,
  Terrain.Rock,
  Terrain.Snow,
  Terrain.Road,
  Terrain.Bridge,
];

export const isWalkable = (t: number): boolean => Number.isFinite(TERRAIN_COST[t] ?? Infinity);

/** Decoration layer values (one per tile). */
export const Deco = {
  None: 0,
  Tree: 1,
  Tree2: 2,
  Boulder: 3,
  Tuft: 4,
  Flowers: 5,
  House: 6,
  HouseRed: 7,
  Well: 8,
  Fence: 9,
  PenGround: 10,
  Library: 11,
  Stump: 12,
  Signpost: 13,
} as const;
export type DecoId = (typeof Deco)[keyof typeof Deco];
