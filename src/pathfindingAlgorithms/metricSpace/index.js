// Import the functions for the switch statement
import { manhattanDistance } from './manhattan.js';
import { euclideanDistance } from './euclidean.js'; 

// Export all metric space functions
export * from './manhattan.js';
export * from './euclidean.js';

// Metric type constants
export const METRIC_TYPES = {
  MANHATTAN: 'manhattan',
  EUCLIDEAN: 'euclidean'
};

// Get heuristic function based on metric type
export function getHeuristicFunction(metricType, weight = 1) {
  switch (metricType) {
    case METRIC_TYPES.MANHATTAN:
      return (nodeA, nodeB) => weight * manhattanDistance(nodeA, nodeB);
    case METRIC_TYPES.EUCLIDEAN:
      return (nodeA, nodeB) => weight * euclideanDistance(nodeA, nodeB);
    default:
      return (nodeA, nodeB) => weight * manhattanDistance(nodeA, nodeB);
  }
}