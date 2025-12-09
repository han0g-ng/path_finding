// Euclidean Distance (L2 norm)
// Standard straight-line distance
export function euclideanDistance(nodeA, nodeB) {
  const dx = nodeA.row - nodeB.row;
  const dy = nodeA.col - nodeB.col;
  return Math.sqrt(dx * dx + dy * dy);
}

// Weighted Euclidean Distance
export function weightedEuclideanDistance(nodeA, nodeB, weight = 1) {
  return weight * euclideanDistance(nodeA, nodeB);
}

// Squared Euclidean Distance (faster computation, no sqrt)
export function squaredEuclideanDistance(nodeA, nodeB) {
  const dx = nodeA.row - nodeB.row;
  const dy = nodeA.col - nodeB.col;
  return dx * dx + dy * dy;
}

// Weighted Squared Euclidean Distance
export function weightedSquaredEuclideanDistance(nodeA, nodeB, weight = 1) {
  return weight * squaredEuclideanDistance(nodeA, nodeB);
}