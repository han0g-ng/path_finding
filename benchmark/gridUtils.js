/**
 * Grid utilities for benchmark testing
 */

// Create a fresh grid
export function createGrid(rows, cols) {
  const grid = [];
  for (let row = 0; row < rows; row++) {
    const currentRow = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
}

// Create a node with default properties
function createNode(row, col) {
  return {
    row,
    col,
    isStart: false,
    isFinish: false,
    isWall: false,
    isVisited: false,
    distance: Infinity,
    totalDistance: Infinity,
    previousNode: null,
    isIntersection: false,
    wasProcessed: false,
    visitedFrom: null,
  };
}

// Reset grid to initial state (preserving walls)
export function resetGrid(grid) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const node = grid[row][col];
      // Keep walls, reset everything else
      node.isVisited = false;
      node.distance = Infinity;
      node.totalDistance = Infinity;
      node.previousNode = null;
      node.isIntersection = false;
      node.wasProcessed = false;
      node.visitedFrom = null;
    }
  }
}

// Apply walls from maze algorithm
export function applyWalls(grid, walls) {
  for (const [row, col] of walls) {
    if (grid[row] && grid[row][col]) {
      grid[row][col].isWall = true;
    }
  }
}

// Get start and finish nodes
export function getStartFinishNodes(grid, rows, cols) {
  const startRow = Math.floor(rows / 2);
  const startCol = Math.floor(cols / 4);
  const finishRow = Math.floor(rows / 2);
  const finishCol = Math.floor((3 * cols) / 4);
  
  const startNode = grid[startRow][startCol];
  const finishNode = grid[finishRow][finishCol];
  
  startNode.isStart = true;
  finishNode.isFinish = true;
  
  // Ensure start/finish are not walls
  startNode.isWall = false;
  finishNode.isWall = false;
  
  return { startNode, finishNode };
}

// Calculate path length
export function getPathLength(finishNode) {
  let length = 0;
  let currentNode = finishNode;
  
  while (currentNode !== null) {
    length++;
    currentNode = currentNode.previousNode;
  }
  
  return length;
}

// Check if path exists
export function pathExists(finishNode) {
  return finishNode.previousNode !== null || finishNode.isStart;
}

// Verify path is valid (connected)
export function isPathValid(finishNode) {
  if (!pathExists(finishNode)) return false;
  
  let currentNode = finishNode;
  let visited = new Set();
  
  while (currentNode !== null) {
    const key = `${currentNode.row},${currentNode.col}`;
    if (visited.has(key)) return false; // Cycle detected
    visited.add(key);
    currentNode = currentNode.previousNode;
  }
  
  return true;
}
