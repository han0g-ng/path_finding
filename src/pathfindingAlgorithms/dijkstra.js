import TinyQueue from 'tinyqueue';

export function dijkstra(grid, startNode, finishNode) {
  if (!startNode || !finishNode || startNode === finishNode) {
    return false;
  }
  startNode.distance = 0;
  let visitedNodesInOrder = [];
  // Use TinyQueue as a priority queue. We push the start node first and only
  // push neighbours when their distance improves. We skip already visited
  // nodes when popping (this avoids needing decreaseKey).
  const compare = (a, b) => a.distance - b.distance;
  let heap = new TinyQueue([], compare);
  heap.push(startNode);
  let maxMemoryUsage = heap.length; // track peak queue size

  while (heap.length > 0) {
    let closestNode = heap.pop();
    if (closestNode.isWall) continue;
    if (closestNode.distance === Infinity) {
      visitedNodesInOrder.maxMemoryUsage = maxMemoryUsage;
      return visitedNodesInOrder;
    }
    if (closestNode === finishNode) {
      visitedNodesInOrder.maxMemoryUsage = maxMemoryUsage;
      return visitedNodesInOrder;
    }
    if (closestNode.isVisited) continue;
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    updateUnvisitedNeighbours(closestNode, grid, heap);

    // Track memory: priority queue + distance map (all nodes need distance tracking)
    maxMemoryUsage = Math.max(maxMemoryUsage, heap.length);
  }
  
  visitedNodesInOrder.maxMemoryUsage = maxMemoryUsage;
  return visitedNodesInOrder;
}

function getNodes(grid) {
  let nodes = [];
  for (let row of grid) {
    for (let node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function updateUnvisitedNeighbours(node, grid, heap) {
  let unvisitedNeighbours = getUnvisitedNeighbours(node, grid);
  for (let unvisitedNeighbour of unvisitedNeighbours) {
    const newDistance = node.distance + 1;
    if (newDistance < unvisitedNeighbour.distance) {
      unvisitedNeighbour.distance = newDistance;
      unvisitedNeighbour.previousNode = node;
      if (heap) heap.push(unvisitedNeighbour);
    }
  }
}

function getUnvisitedNeighbours(node, grid) {
  let neighbours = [];
  let { row, col } = node;
  if (row !== 0) neighbours.push(grid[row - 1][col]);
  if (col !== grid[0].length - 1) neighbours.push(grid[row][col + 1]);
  if (row !== grid.length - 1) neighbours.push(grid[row + 1][col]);
  if (col !== 0) neighbours.push(grid[row][col - 1]);
  return neighbours
    .filter((neighbour) => !neighbour.isWall)
    .filter((neighbour) => !neighbour.isVisited);
}

export function getNodesInShortestPathOrderDijkstra(finishNode) {
  let nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
