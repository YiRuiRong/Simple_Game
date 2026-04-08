export const CELL_SIZE = 40;
export const GRID_COLS = 24;
export const GRID_ROWS = 16;
export const GRID_OFFSET_X = 0;
export const GRID_OFFSET_Y = 0;

export class GridManager {
  constructor(scene, pathWaypoints) {
    this.scene = scene;
    this.pathWaypoints = pathWaypoints;
    // 0 = empty (placeable), 1 = path, 2 = occupied by tower
    this.grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(0));
    this.markPath(pathWaypoints);
  }

  markPath(waypoints) {
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      this.markLine(from.col, from.row, to.col, to.row);
    }
  }

  markAdditionalPath(waypoints) {
    this.markPath(waypoints);
  }

  markLine(c1, r1, c2, r2) {
    const dc = Math.sign(c2 - c1);
    const dr = Math.sign(r2 - r1);
    let c = c1, r = r1;
    while (c !== c2 || r !== r2) {
      this.grid[r][c] = 1;
      if (c !== c2) c += dc;
      if (r !== r2) r += dr;
    }
    this.grid[r2][c2] = 1;
  }

  canPlace(col, row) {
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
    return this.grid[row][col] === 0;
  }

  placeTower(col, row) {
    this.grid[row][col] = 2;
  }

  worldToGrid(x, y) {
    const col = Math.floor((x - GRID_OFFSET_X) / CELL_SIZE);
    const row = Math.floor((y - GRID_OFFSET_Y) / CELL_SIZE);
    return { col, row };
  }

  gridToWorld(col, row) {
    return {
      x: GRID_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2,
      y: GRID_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2,
    };
  }

  getPathAsPixels(waypoints) {
    const wp = waypoints || this.pathWaypoints;
    return wp.map(p => this.gridToWorld(p.col, p.row));
  }
}
