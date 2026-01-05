/**
 * Benchmark runner with accurate timing measurement
 */

import { resetGrid, getPathLength, pathExists } from './gridUtils.js';

/**
 * Run a single algorithm on a grid and measure metrics
 */
export function runAlgorithm(algorithm, grid, startNode, finishNode, algorithmName, params = {}) {
  // Reset grid state
  resetGrid(grid);
  
  // Warm-up (prevent JIT compilation overhead)
  for (let i = 0; i < 2; i++) {
    resetGrid(grid);
    algorithm(grid, startNode, finishNode, ...Object.values(params));
  }
  
  // Actual measurement
  resetGrid(grid);
  
  performance.mark('algorithm-start');
  const visitedNodes = algorithm(grid, startNode, finishNode, ...Object.values(params));
  performance.mark('algorithm-end');
  
  performance.measure('algorithm-execution', 'algorithm-start', 'algorithm-end');
  const measure = performance.getEntriesByName('algorithm-execution')[0];
  const executionTime = measure.duration;
  
  performance.clearMarks();
  performance.clearMeasures();
  
  // Collect metrics
  const pathLength = pathExists(finishNode) ? getPathLength(finishNode) : 0;
  const nodesVisited = visitedNodes ? visitedNodes.length : 0;
  const memoryUsage = visitedNodes && visitedNodes.maxMemoryUsage 
    ? visitedNodes.maxMemoryUsage 
    : 0;
  
  return {
    algorithmName,
    params: JSON.stringify(params),
    pathLength,
    nodesVisited,
    memoryUsage,
    executionTime: parseFloat(executionTime.toFixed(3)),
    pathFound: pathExists(finishNode)
  };
}

/**
 * Run with multiple iterations and return median
 */
export function runAlgorithmWithIterations(
  algorithm, 
  grid, 
  startNode, 
  finishNode, 
  algorithmName, 
  params = {},
  iterations = 5
) {
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const result = runAlgorithm(algorithm, grid, startNode, finishNode, algorithmName, params);
    results.push(result);
  }
  
  // Calculate median execution time
  const times = results.map(r => r.executionTime).sort((a, b) => a - b);
  const medianTime = times[Math.floor(times.length / 2)];
  
  // Other metrics should be consistent across runs
  const firstResult = results[0];
  
  return {
    ...firstResult,
    executionTime: medianTime,
    minTime: times[0],
    maxTime: times[times.length - 1],
    iterations
  };
}

/**
 * Calculate statistics for multiple runs
 */
export function calculateStatistics(values) {
  if (values.length === 0) return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = sorted[Math.floor(sorted.length / 2)];
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  const variance = values.reduce((sum, val) => {
    return sum + Math.pow(val - mean, 2);
  }, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    mean: parseFloat(mean.toFixed(3)),
    median: parseFloat(median.toFixed(3)),
    min: parseFloat(min.toFixed(3)),
    max: parseFloat(max.toFixed(3)),
    stdDev: parseFloat(stdDev.toFixed(3))
  };
}
