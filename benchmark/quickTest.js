/**
 * Quick test script - Run a small benchmark to verify everything works
 */

import { createGrid, applyWalls, getStartFinishNodes, resetGrid, getPathLength } from './gridUtils.js';
import { randomMaze } from '../src/mazeAlgorithms/randomMaze.js';
import { dijkstra } from '../src/pathfindingAlgorithms/dijkstra.js';
import { astar } from '../src/pathfindingAlgorithms/astar.js';
import { METRIC_TYPES } from '../src/pathfindingAlgorithms/metricSpace/index.js';

console.log('🧪 Running quick test...\n');

// Create a small grid
const grid = createGrid(10, 20);
const { startNode, finishNode } = getStartFinishNodes(grid, 10, 20);

// Generate a random maze
const walls = randomMaze(grid, startNode, finishNode);
applyWalls(grid, walls);

console.log(`✓ Created 10x20 grid with ${walls.length} walls`);
console.log(`  Start: (${startNode.row}, ${startNode.col})`);
console.log(`  Finish: (${finishNode.row}, ${finishNode.col})\n`);

// Test Dijkstra
console.log('Testing Dijkstra...');
resetGrid(grid);
const start1 = performance.now();
const dijkstraResult = dijkstra(grid, startNode, finishNode);
const time1 = performance.now() - start1;

if (dijkstraResult && finishNode.previousNode) {
  const pathLength = getPathLength(finishNode);
  console.log(`✓ Dijkstra found path`);
  console.log(`  Path length: ${pathLength}`);
  console.log(`  Nodes visited: ${dijkstraResult.length}`);
  console.log(`  Memory usage: ${dijkstraResult.maxMemoryUsage}`);
  console.log(`  Time: ${time1.toFixed(3)}ms\n`);
} else {
  console.log('✗ Dijkstra failed - no path found\n');
}

// Test A*
console.log('Testing A* (Manhattan, w=1)...');
resetGrid(grid);
const start2 = performance.now();
const astarResult = astar(grid, startNode, finishNode, METRIC_TYPES.MANHATTAN, 1);
const time2 = performance.now() - start2;

if (astarResult && finishNode.previousNode) {
  const pathLength = getPathLength(finishNode);
  console.log(`✓ A* found path`);
  console.log(`  Path length: ${pathLength}`);
  console.log(`  Nodes visited: ${astarResult.length}`);
  console.log(`  Memory usage: ${astarResult.maxMemoryUsage}`);
  console.log(`  Time: ${time2.toFixed(3)}ms\n`);
} else {
  console.log('✗ A* failed - no path found\n');
}

console.log('✅ Quick test completed!');
console.log('\nIf both algorithms found paths, everything is working correctly.');
console.log('You can now run the full benchmark using index.html\n');
