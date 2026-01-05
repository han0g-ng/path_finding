import { getHeuristicFunction, METRIC_TYPES } from './metricSpace/index.js';

export function bidirectionalGreedySearch(grid, startNode, finishNode, metricType = METRIC_TYPES.MANHATTAN, weight = 1) {
  if (!startNode || !finishNode || startNode === finishNode) {
    return false;
  }
  
  const heuristic = getHeuristicFunction(metricType, weight);
  
  // Use Maps to store parent relationships separately for each direction
  // This prevents overwriting when a node is discovered from both sides
  const parentFromStart = new Map();
  const parentFromFinish = new Map();
  const getKey = (node) => `${node.row}-${node.col}`;
  
  let unvisitedNodesStart = [];
  let visitedNodesInOrderStart = [];
  let unvisitedNodesFinish = [];
  let visitedNodesInOrderFinish = [];
  let maxMemoryUsage = 0;
  
  // Initialize start and finish nodes
  startNode.distance = 0;
  finishNode.distance = 0;
  startNode.totalDistance = heuristic(startNode, finishNode);
  finishNode.totalDistance = heuristic(finishNode, startNode);
  startNode.visitedFrom = 'start';
  finishNode.visitedFrom = 'finish';
  
  parentFromStart.set(getKey(startNode), null);
  parentFromFinish.set(getKey(finishNode), null);
  
  unvisitedNodesStart.push(startNode);
  unvisitedNodesFinish.push(finishNode);

  while (
    unvisitedNodesStart.length !== 0 &&
    unvisitedNodesFinish.length !== 0
  ) {
    unvisitedNodesStart.sort((a, b) => a.totalDistance - b.totalDistance);
    unvisitedNodesFinish.sort((a, b) => a.totalDistance - b.totalDistance);
    let closestNodeStart = unvisitedNodesStart.shift();
    let closestNodeFinish = unvisitedNodesFinish.shift();

    closestNodeStart.isVisited = true;
    closestNodeFinish.isVisited = true;
    visitedNodesInOrderStart.push(closestNodeStart);
    visitedNodesInOrderFinish.push(closestNodeFinish);
    
    // Check if the two frontiers meet as direct neighbors
    if (isNeighbour(closestNodeStart, closestNodeFinish)) {
      closestNodeStart.isIntersection = true;
      closestNodeFinish.isIntersection = true;
      
      // Store metadata for path reconstruction
      visitedNodesInOrderStart.maxMemoryUsage = maxMemoryUsage;
      visitedNodesInOrderStart.parentFromStart = parentFromStart;
      visitedNodesInOrderStart.parentFromFinish = parentFromFinish;
      visitedNodesInOrderStart.meetAsNeighbors = true;
      visitedNodesInOrderStart.intersectionFromStart = closestNodeStart;
      visitedNodesInOrderStart.intersectionFromFinish = closestNodeFinish;
      
      return [visitedNodesInOrderStart, visitedNodesInOrderFinish, true];
    }

    // Expand from start side
    let neighbours = getNeighbours(closestNodeStart, grid);
    for (let neighbour of neighbours) {
      const key = getKey(neighbour);
      
      // Check if already visited from finish side - intersection found!
      if (neighbour.visitedFrom === 'finish') {
        neighbour.isIntersection = true;
        
        // Store parent from start side for this intersection
        parentFromStart.set(key, closestNodeStart);
        
        visitedNodesInOrderStart.push(neighbour);
        visitedNodesInOrderStart.maxMemoryUsage = maxMemoryUsage;
        visitedNodesInOrderStart.parentFromStart = parentFromStart;
        visitedNodesInOrderStart.parentFromFinish = parentFromFinish;
        visitedNodesInOrderStart.intersectionNode = neighbour;
        
        return [visitedNodesInOrderStart, visitedNodesInOrderFinish, true];
      }
      
      let distance = closestNodeStart.distance + 1;
      if (neighbourNotInUnvisitedNodes(neighbour, unvisitedNodesStart)) {
        unvisitedNodesStart.push(neighbour);
        neighbour.distance = distance;
        neighbour.totalDistance = heuristic(neighbour, finishNode);
        neighbour.visitedFrom = 'start';
        parentFromStart.set(key, closestNodeStart);
      }
    }

    // Expand from finish side
    neighbours = getNeighbours(closestNodeFinish, grid);
    for (let neighbour of neighbours) {
      const key = getKey(neighbour);
      
      // Check if already visited from start side - intersection found!
      if (neighbour.visitedFrom === 'start') {
        neighbour.isIntersection = true;
        
        // Store parent from finish side for this intersection
        parentFromFinish.set(key, closestNodeFinish);
        
        visitedNodesInOrderFinish.push(neighbour);
        visitedNodesInOrderStart.maxMemoryUsage = maxMemoryUsage;
        visitedNodesInOrderStart.parentFromStart = parentFromStart;
        visitedNodesInOrderStart.parentFromFinish = parentFromFinish;
        visitedNodesInOrderStart.intersectionNode = neighbour;
        
        return [visitedNodesInOrderStart, visitedNodesInOrderFinish, true];
      }
      
      let distance = closestNodeFinish.distance + 1;
      if (neighbourNotInUnvisitedNodes(neighbour, unvisitedNodesFinish)) {
        unvisitedNodesFinish.push(neighbour);
        neighbour.distance = distance;
        neighbour.totalDistance = heuristic(neighbour, startNode);
        neighbour.visitedFrom = 'finish';
        parentFromFinish.set(key, closestNodeFinish);
      }
    }
    
    // Track memory usage
    maxMemoryUsage = Math.max(maxMemoryUsage, 
      unvisitedNodesStart.length + unvisitedNodesFinish.length);
  }
  
  visitedNodesInOrderStart.maxMemoryUsage = maxMemoryUsage;
  return [visitedNodesInOrderStart, visitedNodesInOrderFinish, false];
}

function isNeighbour(nodeA, nodeB) {
  const rowDiff = Math.abs(nodeA.row - nodeB.row);
  const colDiff = Math.abs(nodeA.col - nodeB.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
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

function neighbourNotInUnvisitedNodes(neighbour, unvisitedNodes) {
  for (let node of unvisitedNodes) {
    if (node.row === neighbour.row && node.col === neighbour.col) {
      return false;
    }
  }
  return true;
}

export function getNodesInShortestPathOrderBidirectionalGreedySearch(
  visitedStart,
  visitedFinish
) {
  const getKey = (node) => `${node.row}-${node.col}`;
  
  const parentFromStart = visitedStart.parentFromStart;
  const parentFromFinish = visitedStart.parentFromFinish;
  
  if (!parentFromStart || !parentFromFinish) {
    return [];
  }
  
  let nodesInShortestPathOrder = [];
  
  // Case 1: Two frontiers met as direct neighbors
  if (visitedStart.meetAsNeighbors) {
    const nodeFromStart = visitedStart.intersectionFromStart;
    const nodeFromFinish = visitedStart.intersectionFromFinish;
    
    // Build path from start to nodeFromStart
    let current = nodeFromStart;
    let pathFromStart = [];
    while (current !== null) {
      pathFromStart.unshift(current);
      current = parentFromStart.get(getKey(current));
    }
    
    // Build path from nodeFromFinish to finish
    current = nodeFromFinish;
    let pathFromFinish = [];
    while (current !== null) {
      pathFromFinish.push(current);
      current = parentFromFinish.get(getKey(current));
    }
    
    return [...pathFromStart, ...pathFromFinish];
  }
  
  // Case 2: Found intersection node (node visited from both sides)
  const intersectionNode = visitedStart.intersectionNode;
  if (!intersectionNode) {
    return [];
  }
  
  const intersectionKey = getKey(intersectionNode);
  
  // Build path from start to intersection
  let current = intersectionNode;
  let pathFromStart = [];
  
  // Use parentFromStart to trace back to start
  let key = intersectionKey;
  while (parentFromStart.has(key)) {
    // Find the node with this key
    let node = null;
    for (const n of visitedStart) {
      if (getKey(n) === key) {
        node = n;
        break;
      }
    }
    if (!node) {
      // Also check in visitedFinish (for intersection node)
      for (const n of visitedFinish) {
        if (getKey(n) === key) {
          node = n;
          break;
        }
      }
    }
    if (node) {
      pathFromStart.unshift(node);
    }
    const parent = parentFromStart.get(key);
    if (parent === null) break;
    key = getKey(parent);
  }
  
  // Build path from intersection to finish (exclude intersection itself)
  let pathFromFinish = [];
  key = intersectionKey;
  const parentNode = parentFromFinish.get(key);
  if (parentNode) {
    key = getKey(parentNode);
    while (parentFromFinish.has(key)) {
      let node = null;
      for (const n of visitedFinish) {
        if (getKey(n) === key) {
          node = n;
          break;
        }
      }
      if (node) {
        pathFromFinish.push(node);
      }
      const parent = parentFromFinish.get(key);
      if (parent === null) break;
      key = getKey(parent);
    }
  }
  
  return [...pathFromStart, ...pathFromFinish];
}
