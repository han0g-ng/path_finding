import { bidirectionalGreedySearch } from '../src/pathfindingAlgorithms/bidirectionalGreedySearch.js';
import { METRIC_TYPES } from '../src/pathfindingAlgorithms/metricSpace/index.js';

// Create a simple 5x5 grid
function createSimpleGrid() {
  const grid = [];
  for (let row = 0; row < 5; row++) {
    const currentRow = [];
    for (let col = 0; col < 5; col++) {
      currentRow.push({
        row,
        col,
        isStart: row === 0 && col === 0,
        isFinish: row === 4 && col === 4,
        isWall: false,
        isVisited: false,
        distance: Infinity,
        totalDistance: Infinity,
        previousNode: null
      });
    }
    grid.push(currentRow);
  }
  return grid;
}

const grid = createSimpleGrid();
const startNode = grid[0][0];
const finishNode = grid[4][4];

console.log('Testing Bidirectional Greedy Search on 5x5 grid');
console.log(`Start: (${startNode.row}, ${startNode.col})`);
console.log(`Finish: (${finishNode.row}, ${finishNode.col})`);
console.log('');

const result = bidirectionalGreedySearch(grid, startNode, finishNode, METRIC_TYPES.MANHATTAN, 1);

console.log('Result type:', Array.isArray(result) ? 'array' : typeof result);
console.log('Result length:', result ? result.length : 'N/A');
if (result && result.length === 3) {
  const [visitedStart, visitedFinish, found] = result;
  console.log(`Path found: ${found}`);
  console.log(`Visited from start: ${visitedStart.length}`);
  console.log(`Visited from finish: ${visitedFinish.length}`);
  console.log('');
  console.log('Visited from start:', visitedStart.map(n => `(${n.row},${n.col})${n.isIntersection ? '*' : ''}`).join(' -> '));
  console.log('Visited from finish:', visitedFinish.map(n => `(${n.row},${n.col})${n.isIntersection ? '*' : ''}`).join(' -> '));
  
  // Test path length calculation
  console.log('');
  console.log('Testing path length calculation:');
  
  // Find intersection node
  let intersectionNode = null;
  for (let node of visitedStart) {
    if (node.isIntersection) {
      intersectionNode = node;
      console.log(`Intersection from start: (${node.row}, ${node.col}), visitedFrom: ${node.visitedFrom}`);
      break;
    }
  }
  
  if (!intersectionNode) {
    for (let node of visitedFinish) {
      if (node.isIntersection) {
        intersectionNode = node;
        console.log(`Intersection from finish: (${node.row}, ${node.col}), visitedFrom: ${node.visitedFrom}`);
        break;
      }
    }
  }
  
  if (intersectionNode) {
    let length = 0;
    let current = intersectionNode;
    console.log('Path from intersection to start:');
    while (current !== null && current.visitedFrom === 'start') {
      console.log(`  (${current.row}, ${current.col})`);
      length++;
      current = current.previousNode;
    }
    console.log(`Length to start: ${length}`);
    
    length = 0;
    current = intersectionNode;
    console.log('Path from intersection to finish:');
    while (current !== null && current.visitedFrom === 'finish') {
      console.log(`  (${current.row}, ${current.col})`);
      length++;
      current = current.previousNode;
    }
    console.log(`Length to finish: ${length}`);
  } else {
    console.log('No intersection node found!');
  }
} else {
  console.log('No path found or invalid result');
}
