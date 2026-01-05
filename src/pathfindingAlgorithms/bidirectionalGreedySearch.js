import TinyQueue from 'tinyqueue';
import { getHeuristicFunction, METRIC_TYPES } from './metricSpace/index.js';

export function bidirectionalGreedySearch(grid, startNode, finishNode, metricType = METRIC_TYPES.MANHATTAN, weight = 1) {
  if (!startNode || !finishNode || startNode === finishNode) {
    return false;
  }
  
  const heuristic = getHeuristicFunction(metricType, weight);
  
  let visitedNodesInOrderStart = [];
  let visitedNodesInOrderFinish = [];
  let maxMemoryUsage = 0; // Track memory usage
  
  startNode.distance = 0;
  finishNode.distance = 0;
  startNode.totalDistance = heuristic(startNode, finishNode);
  finishNode.totalDistance = heuristic(finishNode, startNode);
  
  // Use TinyQueue as priority queue for O(log N) operations
  const compare = (a, b) => a.totalDistance - b.totalDistance;
  let openListStart = new TinyQueue([startNode], compare);
  let openListFinish = new TinyQueue([finishNode], compare);
  maxMemoryUsage = openListStart.length + openListFinish.length;

  while (openListStart.length > 0 && openListFinish.length > 0) {
    let closestNodeStart = openListStart.pop();
    let closestNodeFinish = openListFinish.pop();
    
    // Skip if already visited
    if (closestNodeStart.isVisited && closestNodeFinish.isVisited) continue;
    
    if (!closestNodeStart.isVisited) {
      closestNodeStart.isVisited = true;
      visitedNodesInOrderStart.push(closestNodeStart);
    }
    
    if (!closestNodeFinish.isVisited) {
      closestNodeFinish.isVisited = true;
      visitedNodesInOrderFinish.push(closestNodeFinish);
    }
    
    if (isNeighbour(closestNodeStart, closestNodeFinish)) {
      // Mark intersection nodes
      closestNodeStart.isIntersection = true;
      closestNodeFinish.isIntersection = true;
      visitedNodesInOrderStart.maxMemoryUsage = maxMemoryUsage;
      return [visitedNodesInOrderStart, visitedNodesInOrderFinish, true];
    }

    //Start side search
    if (!closestNodeStart.wasProcessed) {
      closestNodeStart.wasProcessed = true;
      let neighbours = getNeighbours(closestNodeStart, grid);
      for (let neighbour of neighbours) {
        if (neighbour.isVisited && visitedNodesInOrderFinish.includes(neighbour)) {
          // Mark intersection node
          neighbour.isIntersection = true;
          visitedNodesInOrderStart.maxMemoryUsage = maxMemoryUsage;
          return [visitedNodesInOrderStart, visitedNodesInOrderFinish, true];
        }
        let distance = closestNodeStart.distance + 1;
        //f(n) = h(n)
        if (distance < neighbour.distance) {
          neighbour.distance = distance;
          neighbour.totalDistance = heuristic(neighbour, finishNode);
          neighbour.previousNode = closestNodeStart;
          openListStart.push(neighbour);
        }
      }
    }

    //Finish side search
    if (!closestNodeFinish.wasProcessed) {
      closestNodeFinish.wasProcessed = true;
      let neighbours = getNeighbours(closestNodeFinish, grid);
      for (let neighbour of neighbours) {
        if (neighbour.isVisited && visitedNodesInOrderStart.includes(neighbour)) {
          // Mark intersection node
          neighbour.isIntersection = true;
          visitedNodesInOrderStart.maxMemoryUsage = maxMemoryUsage;
          return [visitedNodesInOrderStart, visitedNodesInOrderFinish, true];
        }
        let distance = closestNodeFinish.distance + 1;
        //f(n) = h(n)
        if (distance < neighbour.distance) {
          neighbour.distance = distance;
          neighbour.totalDistance = heuristic(neighbour, startNode);
          neighbour.previousNode = closestNodeFinish;
          openListFinish.push(neighbour);
        }
      }
    }
    
    // Track memory: both queues
    maxMemoryUsage = Math.max(maxMemoryUsage, 
      openListStart.length + openListFinish.length);
  }
  
  visitedNodesInOrderStart.maxMemoryUsage = maxMemoryUsage;
  return [visitedNodesInOrderStart, visitedNodesInOrderFinish, false];
}

function isNeighbour(closestNodeStart, closestNodeFinish) {
  let rowStart = closestNodeStart.row;
  let colStart = closestNodeStart.col;
  let rowFinish = closestNodeFinish.row;
  let colFinish = closestNodeFinish.col;
  if (rowFinish === rowStart - 1 && colFinish === colStart) return true;
  if (rowFinish === rowStart && colFinish === colStart + 1) return true;
  if (rowFinish === rowStart + 1 && colFinish === colStart) return true;
  if (rowFinish === rowStart && colFinish === colStart - 1) return true;
  return false;
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

export function getNodesInShortestPathOrderBidirectionalGreedySearch(
  nodeA,
  nodeB
) {
  let nodesInShortestPathOrder = [];
  let currentNode = nodeB;
  while (currentNode !== null) {
    nodesInShortestPathOrder.push(currentNode);
    currentNode = currentNode.previousNode;
  }
  currentNode = nodeA;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
