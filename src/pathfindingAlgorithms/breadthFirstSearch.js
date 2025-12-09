export function breadthFirstSearch(grid, startNode, finishNode) {
  if (!startNode || !finishNode || startNode === finishNode) {
    return false;
  }
  let unvisitedNodes = [];
  let visitedNodesInOrder = [];
  let maxMemoryUsage = 0; // Track memory usage
  
  startNode.distance = 0; // BFS guarantees shortest distance
  startNode.isVisited = true; // Mark visited when adding to queue
  unvisitedNodes.push(startNode);
  
  while (unvisitedNodes.length !== 0) {
    let closestNode = unvisitedNodes.shift();
    if (closestNode.isWall) continue;
    
    if (closestNode === finishNode) {
      visitedNodesInOrder.maxMemoryUsage = maxMemoryUsage;
      return visitedNodesInOrder;
    }
    visitedNodesInOrder.push(closestNode);
    let neighbours = getNeighbours(closestNode, grid);
    for (let neighbour of neighbours) {
      if (!neighbour.isVisited && !neighbour.isWall) {
        neighbour.isVisited = true; // Mark visited when adding to queue
        neighbour.previousNode = closestNode;
        neighbour.distance = closestNode.distance + 1;
        unvisitedNodes.push(neighbour);
      }
    }
    
    // Track memory: visited nodes + queue size
    maxMemoryUsage = Math.max(maxMemoryUsage, unvisitedNodes.length);
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
  return neighbours;
}



export function getNodesInShortestPathOrderBFS(finishNode) {
  let nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
