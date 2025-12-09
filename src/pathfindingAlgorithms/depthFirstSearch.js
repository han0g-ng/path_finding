export function depthFirstSearch(grid, startNode, finishNode) {
  if (!startNode || !finishNode || startNode === finishNode) {
    return false;
  }
  let unvisitedNodes = [];
  let visitedNodesInOrder = [];
  let maxMemoryUsage = 0; // Track stack depth
  
  unvisitedNodes.push(startNode);
  
  while (unvisitedNodes.length !== 0) {
    let closestNode = unvisitedNodes.shift();
    if (closestNode.isWall) continue;
    if (closestNode === finishNode) {
      visitedNodesInOrder.maxMemoryUsage = maxMemoryUsage;
      return visitedNodesInOrder;
    }
    visitedNodesInOrder.push(closestNode);
    closestNode.isVisited = true;
    
    let unvisitedNeighbours = getUnvisitedNeighbours(closestNode, grid);
    for (let unvisitedNeighbour of unvisitedNeighbours) {
      unvisitedNeighbour.previousNode = closestNode;
      // DFS: No distance calculation for visited nodes
      unvisitedNodes.unshift(unvisitedNeighbour);
    }
    
    // Track memory: stack depth (unvisitedNodes = call stack)
    maxMemoryUsage = Math.max(maxMemoryUsage, unvisitedNodes.length);
  }
  
  visitedNodesInOrder.maxMemoryUsage = maxMemoryUsage;
  return visitedNodesInOrder;
}

function getUnvisitedNeighbours(node, grid) {
  let neighbours = [];
  let { row, col } = node;
  if (col !== 0) neighbours.push(grid[row][col - 1]);
  if (row !== 0) neighbours.push(grid[row - 1][col]);
  if (col !== grid[0].length - 1) neighbours.push(grid[row][col + 1]);
  if (row !== grid.length - 1) neighbours.push(grid[row + 1][col]);
  return neighbours.filter((neighbour) => !neighbour.isVisited);
}

export function getNodesInShortestPathOrderDFS(finishNode) {
  let nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  
  // Set distance based on index in shortest path
  for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
    nodesInShortestPathOrder[i].distance = i;
  }
  
  return nodesInShortestPathOrder;
}
