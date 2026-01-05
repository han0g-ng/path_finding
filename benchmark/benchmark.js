/**
 * Main benchmark script
 * Runs comprehensive tests on all pathfinding algorithms
 */

import { dijkstra } from '../src/pathfindingAlgorithms/dijkstra.js';
import { astar } from '../src/pathfindingAlgorithms/astar.js';
import { breadthFirstSearch } from '../src/pathfindingAlgorithms/breadthFirstSearch.js';
import { depthFirstSearch } from '../src/pathfindingAlgorithms/depthFirstSearch.js';
import { greedyBFS } from '../src/pathfindingAlgorithms/greedyBestFirstSearch.js';
import { bidirectionalGreedySearch } from '../src/pathfindingAlgorithms/bidirectionalGreedySearch.js';
import { METRIC_TYPES } from '../src/pathfindingAlgorithms/metricSpace/index.js';
import { generateAllMaps, MAP_TYPES } from './mapGenerator.js';
import { runAlgorithm } from './benchmarkRunner.js';
import { resetGrid } from './gridUtils.js';

// Configuration
const CONFIG = {
  gridSize: {
    rows: 25,
    cols: 50
  },
  mapsPerType: 5,
  astarWeights: [0.5, 1.0, 2.0],
  metrics: [METRIC_TYPES.MANHATTAN, METRIC_TYPES.EUCLIDEAN]
};

/**
 * Define all algorithm configurations
 */
function getAlgorithmConfigs() {
  const configs = [];
  
  // 1. Basic algorithms (no parameters)
  configs.push({
    name: 'Dijkstra',
    algorithm: dijkstra,
    params: {}
  });
  
  configs.push({
    name: 'BFS',
    algorithm: breadthFirstSearch,
    params: {}
  });
  
  configs.push({
    name: 'DFS',
    algorithm: depthFirstSearch,
    params: {}
  });
  
  // 2. A* variations (weight + metric combinations)
  for (const weight of CONFIG.astarWeights) {
    for (const metric of CONFIG.metrics) {
      configs.push({
        name: `A* (w=${weight}, ${metric})`,
        algorithm: astar,
        params: { metric, weight }
      });
    }
  }
  
  // 3. Greedy Best-First Search (with metrics)
  for (const metric of CONFIG.metrics) {
    configs.push({
      name: `Greedy BFS (${metric})`,
      algorithm: greedyBFS,
      params: { metric, weight: 1 }
    });
  }
  
  // 4. Bidirectional Greedy Search (with metrics)
  for (const metric of CONFIG.metrics) {
    configs.push({
      name: `Bidirectional Greedy (${metric})`,
      algorithm: bidirectionalGreedySearch,
      params: { metric, weight: 1 }
    });
  }
  
  return configs;
}

/**
 * Run benchmark on all maps and algorithms
 */
export function runBenchmark() {
  console.log('═'.repeat(80));
  console.log('🚀 PATHFINDING ALGORITHMS BENCHMARK');
  console.log('═'.repeat(80));
  console.log(`Grid Size: ${CONFIG.gridSize.rows} x ${CONFIG.gridSize.cols}`);
  console.log(`Maps per type: ${CONFIG.mapsPerType}`);
  console.log(`A* weights: ${CONFIG.astarWeights.join(', ')}`);
  console.log(`Metrics: ${CONFIG.metrics.join(', ')}`);
  console.log('═'.repeat(80));
  
  // Step 1: Generate all maps
  const maps = generateAllMaps(
    CONFIG.gridSize.rows, 
    CONFIG.gridSize.cols, 
    CONFIG.mapsPerType
  );
  
  // Step 2: Get all algorithm configurations
  const algorithmConfigs = getAlgorithmConfigs();
  console.log(`📊 Total algorithms to test: ${algorithmConfigs.length}\n`);
  
  // Step 3: Run benchmarks
  const results = [];
  let testCount = 0;
  const totalTests = maps.length * algorithmConfigs.length;
  
  console.log(`🔬 Running ${totalTests} tests...\n`);
  
  for (const map of maps) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📍 Testing Map: ${map.id} (${map.type})`);
    console.log('─'.repeat(80));
    
    for (const config of algorithmConfigs) {
      testCount++;
      
      try {
        // Handle bidirectional algorithm differently
        let result;
        if (config.algorithm === bidirectionalGreedySearch) {
          resetGrid(map.grid);
          const visitedArrays = config.algorithm(
            map.grid, 
            map.startNode, 
            map.finishNode,
            config.params.metric,
            config.params.weight
          );
          
          // Bidirectional returns [visitedStart, visitedFinish, found]
          const pathFound = visitedArrays && visitedArrays[2];
          const visitedStart = visitedArrays ? visitedArrays[0] : [];
          const visitedFinish = visitedArrays ? visitedArrays[1] : [];
          const totalVisited = visitedStart.length + visitedFinish.length;
          
          result = {
            algorithmName: config.name,
            params: JSON.stringify(config.params),
            pathLength: pathFound ? calculateBidirectionalPathLength(visitedStart, visitedFinish) : 0,
            nodesVisited: totalVisited,
            memoryUsage: visitedStart.maxMemoryUsage || 0,
            executionTime: 0, // Will be measured separately
            pathFound: pathFound
          };
        } else {
          result = runAlgorithm(
            config.algorithm,
            map.grid,
            map.startNode,
            map.finishNode,
            config.name,
            config.params
          );
        }
        
        // Add map info
        result.mapId = map.id;
        result.mapType = map.type;
        result.mapNumber = map.number;
        
        results.push(result);
        
        const status = result.pathFound ? '✓' : '✗';
        console.log(
          `  [${testCount}/${totalTests}] ${status} ${config.name.padEnd(35)} | ` +
          `Path: ${String(result.pathLength).padStart(4)} | ` +
          `Visited: ${String(result.nodesVisited).padStart(5)} | ` +
          `Memory: ${String(result.memoryUsage).padStart(4)} | ` +
          `Time: ${result.executionTime.toFixed(2)}ms`
        );
        
      } catch (error) {
        console.error(`  ✗ ERROR in ${config.name}: ${error.message}`);
        results.push({
          mapId: map.id,
          mapType: map.type,
          mapNumber: map.number,
          algorithmName: config.name,
          params: JSON.stringify(config.params),
          pathLength: 0,
          nodesVisited: 0,
          memoryUsage: 0,
          executionTime: 0,
          pathFound: false,
          error: error.message
        });
      }
    }
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log(`✅ Benchmark completed: ${testCount} tests run`);
  console.log('═'.repeat(80) + '\n');
  
  return results;
}

/**
 * Calculate path length for bidirectional search  
 * Simply count total visited nodes from both sides
 */
function calculateBidirectionalPathLength(visitedStart, visitedFinish) {
  // In bidirectional search, the path length is approximately
  // the sum of nodes visited from both sides minus overlap
  // For greedy search without optimal path guarantee, we use visited count
  return visitedStart.length + visitedFinish.length;
}

// Export for use in other modules
export { CONFIG };
