/**
 * Map generation utilities for benchmark testing
 */

import { randomMaze } from '../src/mazeAlgorithms/randomMaze.js';
import { horizontalMaze } from '../src/mazeAlgorithms/horizontalMaze.js';
import { verticalMaze } from '../src/mazeAlgorithms/verticalMaze.js';
import { recursiveDivisionMaze } from '../src/mazeAlgorithms/recursiveDivision.js';
import { createGrid, applyWalls, getStartFinishNodes, resetGrid } from './gridUtils.js';
import { breadthFirstSearch } from '../src/pathfindingAlgorithms/breadthFirstSearch.js';

// Map type constants
export const MAP_TYPES = {
  RANDOM: 'Random',
  HORIZONTAL: 'Horizontal',
  VERTICAL: 'Vertical',
  RECURSIVE_DIVISION: 'Recursive Division'
};

/**
 * Generate a map with the specified type
 * Ensures the map has a valid path from start to finish
 */
export function generateMap(mapType, rows, cols, maxAttempts = 50) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Create fresh grid
    const grid = createGrid(rows, cols);
    const { startNode, finishNode } = getStartFinishNodes(grid, rows, cols);
    
    // Generate walls based on map type
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
      case MAP_TYPES.RECURSIVE_DIVISION:
        walls = recursiveDivisionMaze(grid, startNode, finishNode);
        break;
      default:
        throw new Error(`Unknown map type: ${mapType}`);
    }
    
    // Apply walls
    applyWalls(grid, walls);
    
    // Verify path exists using BFS
    resetGrid(grid);
    const result = breadthFirstSearch(grid, startNode, finishNode);
    
    if (result && result.length > 0 && finishNode.previousNode !== null) {
      // Valid map with path
      console.log(`✓ Generated valid ${mapType} map (attempt ${attempts})`);
      resetGrid(grid); // Reset for actual testing
      return { grid, startNode, finishNode };
    }
    
    console.log(`✗ ${mapType} map has no path, retrying... (attempt ${attempts})`);
  }
  
  throw new Error(`Failed to generate valid ${mapType} map after ${maxAttempts} attempts`);
}

/**
 * Generate multiple maps of each type
 */
export function generateAllMaps(rows, cols, mapsPerType = 5) {
  const maps = [];
  const types = Object.values(MAP_TYPES);
  
  console.log(`\n🗺️  Generating ${types.length} map types x ${mapsPerType} maps = ${types.length * mapsPerType} total maps...\n`);
  
  for (const mapType of types) {
    console.log(`Generating ${mapType} maps...`);
    for (let i = 0; i < mapsPerType; i++) {
      const mapData = generateMap(mapType, rows, cols);
      maps.push({
        id: `${mapType}_${i + 1}`,
        type: mapType,
        number: i + 1,
        ...mapData
      });
    }
    console.log(`✓ Completed ${mapsPerType} ${mapType} maps\n`);
  }
  
  console.log(`✅ Total maps generated: ${maps.length}\n`);
  return maps;
}
