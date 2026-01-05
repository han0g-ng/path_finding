import TinyQueue from 'tinyqueue';
import { getHeuristicFunction, METRIC_TYPES } from './metricSpace/index.js';

export function greedyBFS(grid, startNode, finishNode, metricType = METRIC_TYPES.MANHATTAN, weight = 1) {
  if (!startNode || !finishNode || startNode === finishNode) {
    return false;
  }
  
  const heuristic = getHeuristicFunction(metricType, weight);
  
  let visitedNodesInOrder = []; //closed list
  let maxMemoryUsage = 0; // Track memory usage
  
  startNode.distance = 0;
  startNode.totalDistance = heuristic(startNode, finishNode);
  
  // Use TinyQueue as priority queue for O(log N) operations
  const compare = (a, b) => a.totalDistance - b.totalDistance;
  let openList = new TinyQueue([startNode], compare);
  maxMemoryUsage = openList.length;

  while (openList.length > 0) {
    let closestNode = openList.pop();
    
    // Skip if already visited (allows duplicates in queue)
    if (closestNode.isVisited) continue;
    
    if (closestNode === finishNode) {
      visitedNodesInOrder.maxMemoryUsage = maxMemoryUsage;
      return visitedNodesInOrder;
    }

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    let neighbours = getNeighbours(closestNode, grid);
    for (let neighbour of neighbours) {
      let distance = closestNode.distance + 1;
      //f(n) = h(n)
      if (distance < neighbour.distance) {
        neighbour.distance = distance;
        neighbour.totalDistance = heuristic(neighbour, finishNode);
        neighbour.previousNode = closestNode;
        openList.push(neighbour);
      }
    }
    
    // Track memory: priority queue size
    maxMemoryUsage = Math.max(maxMemoryUsage, openList.length);
  }
  
  visitedNodesInOrder.maxMemoryUsage = maxMemoryUsage;
  return visitedNodesInOrder;
}

function getNeighbours(node, grid) {
  let neighbours = [];
  let { row, col } = node;
  if (row !== 0) neighbours.push(grid[row - 1][col]);
  if (col !== grid[0].length - 1) neighbours.push(grid[row][col + 1]);
  if (row !== grid.length - 1) neighbours.push(grid[row + 1][col]);
  if (col !== 0) neighbours.push(grid[row][col - 1]);
  return neighbours.filter(
    (neighbour) => !neighbour.isWall && !neighbour.isVisited
  );
}

export function getNodesInShortestPathOrderGreedyBFS(finishNode) {
  let nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
