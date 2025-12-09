// Manhattan Distance (L1 norm)
// Also known as taxicab distance or city block distance
export function manhattanDistance(nodeA, nodeB) {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

// Weighted Manhattan Distance
export function weightedManhattanDistance(nodeA, nodeB, weight = 1) {
  return weight * manhattanDistance(nodeA, nodeB);
}