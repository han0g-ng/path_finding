/**
 * Complete Benchmark with ALL algorithms
 * Run: node runFullBenchmark.mjs
 */

import { performance } from 'perf_hooks';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import from existing implementations
import { dijkstra } from '../src/pathfindingAlgorithms/dijkstra.js';
import { breadthFirstSearch } from '../src/pathfindingAlgorithms/breadthFirstSearch.js';
import { depthFirstSearch } from '../src/pathfindingAlgorithms/depthFirstSearch.js';
import { astar } from '../src/pathfindingAlgorithms/astar.js';
import { greedyBFS } from '../src/pathfindingAlgorithms/greedyBestFirstSearch.js';
import { bidirectionalGreedySearch, getNodesInShortestPathOrderBidirectionalGreedySearch } from '../src/pathfindingAlgorithms/bidirectionalGreedySearch.js';
import { METRIC_TYPES } from '../src/pathfindingAlgorithms/metricSpace/index.js';
import { randomMaze } from '../src/mazeAlgorithms/randomMaze.js';
import { horizontalMaze } from '../src/mazeAlgorithms/horizontalMaze.js';
import { verticalMaze } from '../src/mazeAlgorithms/verticalMaze.js';
import { recursiveDivisionMaze } from '../src/mazeAlgorithms/recursiveDivision.js';

// Configuration
const CONFIG = {
  gridSize: { rows: 25, cols: 50 },
  mapsPerType: 5,
  astarWeights: [0.5, 1.0, 2.0],
  metrics: [METRIC_TYPES.MANHATTAN, METRIC_TYPES.EUCLIDEAN]
};

// Grid utilities
function createNode(row, col) {
  return {
    row, col,
    isStart: false, isFinish: false, isWall: false, isVisited: false,
    distance: Infinity, totalDistance: Infinity, previousNode: null,
    isIntersection: false, wasProcessed: false,
  };
}

function createGrid(rows, cols) {
  const grid = [];
  for (let row = 0; row < rows; row++) {
    const currentRow = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
}

function resetGrid(grid) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const node = grid[row][col];
      node.isVisited = false;
      node.distance = Infinity;
      node.totalDistance = Infinity;
      node.previousNode = null;
      node.isIntersection = false;
      node.wasProcessed = false;
      node.visitedFrom = null;  // Reset for bidirectional search
    }
  }
}

function applyWalls(grid, walls) {
  for (const [row, col] of walls) {
    if (grid[row] && grid[row][col]) {
      grid[row][col].isWall = true;
    }
  }
}

function getStartFinishNodes(grid, rows, cols, mapNumber = 1) {
  // Tạo các vị trí khác nhau cho mỗi testcase
  const positions = [
    // Map 1: Center-left to center-right (original)
    { startRow: Math.floor(rows / 2), startCol: Math.floor(cols / 4), 
      finishRow: Math.floor(rows / 2), finishCol: Math.floor((3 * cols) / 4) },
    // Map 2: Top-left to bottom-right
    { startRow: Math.floor(rows / 4), startCol: Math.floor(cols / 4), 
      finishRow: Math.floor((3 * rows) / 4), finishCol: Math.floor((3 * cols) / 4) },
    // Map 3: Bottom-left to top-right
    { startRow: Math.floor((3 * rows) / 4), startCol: Math.floor(cols / 5), 
      finishRow: Math.floor(rows / 5), finishCol: Math.floor((4 * cols) / 5) },
    // Map 4: Center-top to center-bottom
    { startRow: Math.floor(rows / 5), startCol: Math.floor(cols / 2), 
      finishRow: Math.floor((4 * rows) / 5), finishCol: Math.floor(cols / 2) },
    // Map 5: Near corners
    { startRow: Math.floor(rows / 6), startCol: Math.floor(cols / 6), 
      finishRow: Math.floor((5 * rows) / 6), finishCol: Math.floor((5 * cols) / 6) },
  ];
  
  const pos = positions[mapNumber - 1] || positions[0];
  
  const startNode = grid[pos.startRow][pos.startCol];
  const finishNode = grid[pos.finishRow][pos.finishCol];
  
  startNode.isStart = true;
  finishNode.isFinish = true;
  startNode.isWall = false;
  finishNode.isWall = false;
  
  return { startNode, finishNode };
}

function getPathLength(finishNode) {
  let length = 0;
  let currentNode = finishNode;
  while (currentNode !== null) {
    length++;
    currentNode = currentNode.previousNode;
  }
  return length;
}

function pathExists(finishNode) {
  return finishNode.previousNode !== null || finishNode.isStart;
}

// Map generation
const MAP_TYPES = {
  RANDOM: 'Random',
  HORIZONTAL: 'Horizontal',
  VERTICAL: 'Vertical',
  RECURSIVE: 'Recursive',
};

function generateMap(mapType, rows, cols, mapNumber = 1, maxAttempts = 50) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    const grid = createGrid(rows, cols);
    const { startNode, finishNode } = getStartFinishNodes(grid, rows, cols, mapNumber);
    
    let walls = [];
    switch (mapType) {
      case MAP_TYPES.RANDOM:
        walls = randomMaze(grid, startNode, finishNode);
        break;
      case MAP_TYPES.HORIZONTAL:
        walls = horizontalMaze(grid, startNode, finishNode);
        break;
      case MAP_TYPES.VERTICAL:
        walls = verticalMaze(grid, startNode, finishNode);
        break;
      case MAP_TYPES.RECURSIVE:
        walls = recursiveDivisionMaze(grid, startNode, finishNode);
        break;
    }
    
    applyWalls(grid, walls);
    resetGrid(grid);
    const result = breadthFirstSearch(grid, startNode, finishNode);
    
    if (result && result.length > 0 && finishNode.previousNode !== null) {
      console.log(`  ✓ Generated valid ${mapType} map (attempt ${attempts})`);
      resetGrid(grid);
      return { grid, startNode, finishNode };
    }
  }
  
  throw new Error(`Failed to generate valid ${mapType} map after ${maxAttempts} attempts`);
}

function generateAllMaps(rows, cols, mapsPerType) {
  const maps = [];
  const types = Object.values(MAP_TYPES);
  
  console.log(`\n🗺️  Generating ${types.length} map types × ${mapsPerType} maps...\n`);
  
  for (const mapType of types) {
    console.log(`Generating ${mapType} maps...`);
    for (let i = 0; i < mapsPerType; i++) {
      const mapData = generateMap(mapType, rows, cols, i + 1);
      maps.push({
        id: `${mapType}_${i + 1}`,
        type: mapType,
        number: i + 1,
        ...mapData
      });
    }
    console.log(`✓ Completed ${mapsPerType} ${mapType} maps\n`);
  }
  
  return maps;
}

// Benchmark runner
function runAlgorithm(algorithm, grid, startNode, finishNode, algorithmName, params = {}) {
  resetGrid(grid);
  
  // Warm-up
  for (let i = 0; i < 2; i++) {
    resetGrid(grid);
    algorithm(grid, startNode, finishNode, ...Object.values(params));
  }
  
  // Actual measurement
  resetGrid(grid);
  const start = performance.now();
  const visitedNodes = algorithm(grid, startNode, finishNode, ...Object.values(params));
  const executionTime = performance.now() - start;
  
  let pathLength = 0;
  let nodesVisited = 0;
  let memoryUsage = 0;
  
  // Handle bidirectional search differently
  if (Array.isArray(visitedNodes) && visitedNodes.length === 3) {
    // Bidirectional returns [visitedStart, visitedFinish, found]
    const [visitedStart, visitedFinish, found] = visitedNodes;
    nodesVisited = visitedStart.length + visitedFinish.length;
    memoryUsage = visitedStart.maxMemoryUsage || 0;
    
    // Calculate actual path length using the same method as visualizer
    if (found) {
      const shortestPath = getNodesInShortestPathOrderBidirectionalGreedySearch(visitedStart, visitedFinish);
      pathLength = shortestPath.length;
    } else {
      pathLength = 0;
    }
    
    return {
      algorithmName,
      params: JSON.stringify(params),
      pathLength,
      nodesVisited,
      memoryUsage,
      executionTime: parseFloat(executionTime.toFixed(3)),
      pathFound: found
    };
  } else if (visitedNodes) {
    nodesVisited = visitedNodes.length;
    memoryUsage = visitedNodes.maxMemoryUsage || 0;
    pathLength = pathExists(finishNode) ? getPathLength(finishNode) : 0;
  }
  
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

// Algorithm configurations
function getAlgorithmConfigs() {
  const configs = [];
  
  // Basic algorithms
  configs.push({ name: 'Dijkstra', algorithm: dijkstra, params: {} });
  configs.push({ name: 'BFS', algorithm: breadthFirstSearch, params: {} });
  configs.push({ name: 'DFS', algorithm: depthFirstSearch, params: {} });
  
  // A* variations
  for (const weight of CONFIG.astarWeights) {
    for (const metric of CONFIG.metrics) {
      configs.push({
        name: `A* (w=${weight}, ${metric})`,
        algorithm: astar,
        params: { metric, weight }
      });
    }
  }
  
  // Greedy Best-First Search
  for (const metric of CONFIG.metrics) {
    configs.push({
      name: `Greedy BFS (${metric})`,
      algorithm: greedyBFS,
      params: { metric, weight: 1 }
    });
  }
  
  // Bidirectional Greedy Search
  for (const metric of CONFIG.metrics) {
    configs.push({
      name: `Bidirectional Greedy (${metric})`,
      algorithm: bidirectionalGreedySearch,
      params: { metric, weight: 1 }
    });
  }
  
  return configs;
}

// Main benchmark
function runBenchmark() {
  console.log('═'.repeat(80));
  console.log('🚀 PATHFINDING ALGORITHMS BENCHMARK - COMPLETE VERSION');
  console.log('═'.repeat(80));
  console.log(`Grid Size: ${CONFIG.gridSize.rows} × ${CONFIG.gridSize.cols}`);
  console.log(`Maps per type: ${CONFIG.mapsPerType}`);
  console.log(`A* weights: ${CONFIG.astarWeights.join(', ')}`);
  console.log(`Metrics: ${CONFIG.metrics.join(', ')}`);
  console.log('═'.repeat(80));
  
  const maps = generateAllMaps(CONFIG.gridSize.rows, CONFIG.gridSize.cols, CONFIG.mapsPerType);
  const algorithmConfigs = getAlgorithmConfigs();
  
  console.log(`📊 Total algorithms to test: ${algorithmConfigs.length}\n`);
  
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
        const result = runAlgorithm(
          config.algorithm,
          map.grid,
          map.startNode,
          map.finishNode,
          config.name,
          config.params
        );
        
        result.mapId = map.id;
        result.mapType = map.type;
        result.mapNumber = map.number;
        result.startRow = map.startNode.row;
        result.startCol = map.startNode.col;
        result.finishRow = map.finishNode.row;
        result.finishCol = map.finishNode.col;
        
        results.push(result);
        
        const status = result.pathFound ? '✓' : '✗';
        console.log(
          `  [${testCount}/${totalTests}] ${status} ${config.name.padEnd(40)} | ` +
          `Path: ${String(result.pathLength).padStart(4)} | ` +
          `Visited: ${String(result.nodesVisited).padStart(5)} | ` +
          `Memory: ${String(result.memoryUsage).padStart(4)} | ` +
          `Time: ${result.executionTime.toFixed(2)}ms`
        );
        
      } catch (error) {
        console.error(`  ✗ ERROR in ${config.name}: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log(`✅ Benchmark completed: ${testCount} tests run`);
  console.log('═'.repeat(80) + '\n');
  
  return results;
}

// CSV Export
function exportToCSV(results) {
  const headers = [
    'Map_Type', 'Map_Number', 'Map_ID', 
    'Start_Row', 'Start_Col', 'Finish_Row', 'Finish_Col',
    'Algorithm_Name', 'Parameters',
    'Path_Found', 'Path_Length', 'Nodes_Visited', 'Memory_Usage_Nodes', 'Execution_Time_ms'
  ];
  
  const rows = results.map(r => [
    r.mapType, r.mapNumber, r.mapId, 
    r.startRow, r.startCol, r.finishRow, r.finishCol,
    r.algorithmName, r.params,
    r.pathFound ? 'Yes' : 'No', r.pathLength, r.nodesVisited, r.memoryUsage, r.executionTime
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
}

function generateSummaryCSV(results) {
  const grouped = {};
  
  for (const result of results) {
    const key = result.algorithmName;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(result);
  }
  
  const summaryRows = [];
  
  for (const [algorithmName, algorithmResults] of Object.entries(grouped)) {
    const validResults = algorithmResults.filter(r => r.pathFound);
    if (validResults.length === 0) continue;
    
    const avg = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;
    
    const pathLengths = validResults.map(r => r.pathLength);
    const nodesVisited = validResults.map(r => r.nodesVisited);
    const memoryUsage = validResults.map(r => r.memoryUsage);
    const executionTimes = validResults.map(r => r.executionTime);
    
    summaryRows.push({
      Algorithm: algorithmName,
      Tests_Run: validResults.length,
      Avg_Path_Length: avg(pathLengths).toFixed(2),
      Avg_Nodes_Visited: avg(nodesVisited).toFixed(2),
      Avg_Memory_Usage: avg(memoryUsage).toFixed(2),
      Avg_Execution_Time: avg(executionTimes).toFixed(3),
      Min_Path: Math.min(...pathLengths),
      Max_Path: Math.max(...pathLengths)
    });
  }
  
  const headers = Object.keys(summaryRows[0]);
  return [
    headers.join(','),
    ...summaryRows.map(row => headers.map(h => `"${row[h]}"`).join(','))
  ].join('\n');
}

// Run and save
console.log('Starting COMPLETE benchmark with ALL algorithms...\n');

const results = runBenchmark();

// Save results
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = join(__dirname, 'results');

try {
  mkdirSync(outputDir, { recursive: true });
} catch (e) {}

const fullCSV = exportToCSV(results);
const fullPath = join(outputDir, `benchmark_FULL_results_${timestamp}.csv`);
writeFileSync(fullPath, fullCSV, 'utf8');
console.log(`\n✓ Saved full results to: ${fullPath}`);

const summaryCSV = generateSummaryCSV(results);
const summaryPath = join(outputDir, `benchmark_FULL_summary_${timestamp}.csv`);
writeFileSync(summaryPath, summaryCSV, 'utf8');
console.log(`✓ Saved summary to: ${summaryPath}`);

console.log('\n🎉 COMPLETE Benchmark finished! All 14 algorithms tested.\n');
