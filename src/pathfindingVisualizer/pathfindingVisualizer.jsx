import React, { Component } from "react";
import "./pathfindingVisualizer.css";
import Node from "./Node/node";
import NavBar from "./navbar";

//Pathfinding Algorithms
import {
  dijkstra,
  getNodesInShortestPathOrderDijkstra,
} from "../pathfindingAlgorithms/dijkstra";
import {
  astar,
  getNodesInShortestPathOrderAstar,
} from "../pathfindingAlgorithms/astar";
import {
  breadthFirstSearch,
  getNodesInShortestPathOrderBFS,
} from "../pathfindingAlgorithms/breadthFirstSearch";
import {
  depthFirstSearch,
  getNodesInShortestPathOrderDFS,
} from "../pathfindingAlgorithms/depthFirstSearch";
import {
  greedyBFS,
  getNodesInShortestPathOrderGreedyBFS,
} from "../pathfindingAlgorithms/greedyBestFirstSearch";
import {
  bidirectionalGreedySearch,
  getNodesInShortestPathOrderBidirectionalGreedySearch,
} from "../pathfindingAlgorithms/bidirectionalGreedySearch";

//Maze Algorithms
import { randomMaze } from "../mazeAlgorithms/randomMaze";
import { recursiveDivisionMaze } from "../mazeAlgorithms/recursiveDivision";
import { verticalMaze } from "../mazeAlgorithms/verticalMaze";
import { horizontalMaze } from "../mazeAlgorithms/horizontalMaze";

const initialNum = getInitialNum(window.innerWidth, window.innerHeight);
const initialNumRows = initialNum[0];
const initialNumColumns = initialNum[1];

const startFinishNode = getStartFinishNode(initialNumRows, initialNumColumns);
let startNodeRow = startFinishNode[0];
let startNodeCol = startFinishNode[1];
let finishNodeRow = startFinishNode[2];
let finishNodeCol = startFinishNode[3];

class PathfindingVisualizer extends Component {
  state = {
    grid: [],
    mouseIsPressed: false,
    visualizingAlgorithm: false,
    generatingMaze: false,
    width: window.innerWidth,
    height: window.innerHeight,
    numRows: initialNumRows,
    numColumns: initialNumColumns,
    speed: 10,
    mazeSpeed: 10,
    showDistances: false,
    skipAnimation: false, // Add skip animation mode
    // Grid size mode: 'auto' or 'custom'
    gridSizeMode: 'auto',
    customRows: 15,
    customCols: 30,
    cellSize: 25, // Default cell size in pixels for custom mode
    // Add results state
    showResults: false,
    algorithmResults: {
      algorithmName: '',
      pathLength: 0,
      visitedNodes: 0,
      memoryUsage: 0
    },
    // Add mode for setting start/finish nodes
    settingMode: null // null, 'start', or 'finish'
  };

  updateDimensions = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  updateSpeed = (path, maze) => {
    this.setState({ speed: path, mazeSpeed: maze });
  };

  toggleDistanceMode = () => {
    this.setState({ showDistances: !this.state.showDistances });
  };

  // Grid size mode functions
  setGridSizeMode = (mode) => {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    
    if (mode === 'auto') {
      // Reset to auto-calculated dimensions
      const newNum = getInitialNum(window.innerWidth, window.innerHeight);
      const newNumRows = newNum[0];
      const newNumColumns = newNum[1];
      
      // Update start/finish positions
      const newStartFinish = getStartFinishNode(newNumRows, newNumColumns);
      startNodeRow = newStartFinish[0];
      startNodeCol = newStartFinish[1];
      finishNodeRow = newStartFinish[2];
      finishNodeCol = newStartFinish[3];
      
      const newGrid = getInitialGrid(newNumRows, newNumColumns);
      this.setState({
        gridSizeMode: 'auto',
        numRows: newNumRows,
        numColumns: newNumColumns,
        grid: newGrid,
      });
    } else {
      this.setState({ gridSizeMode: 'custom' });
    }
  };

  applyCustomGridSize = () => {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    
    const { customRows, customCols } = this.state;
    
    // Parse and validate input values
    const rowsValue = parseInt(customRows, 10);
    const colsValue = parseInt(customCols, 10);
    
    // Check if inputs are valid numbers
    if (isNaN(rowsValue) || isNaN(colsValue)) {
      alert('Please enter valid numbers for rows and columns.');
      // Reset input to current grid size
      this.setState({
        customRows: this.state.numRows,
        customCols: this.state.numColumns,
      });
      return;
    }
    
    // Check if values are within valid range (min 5, max 20 for rows, max 40 for cols)
    if (rowsValue < 5 || rowsValue > 20 || colsValue < 5 || colsValue > 40) {
      alert(`Grid size must be:\n- Rows: 5-20\n- Columns: 5-40\n\nYour input: ${rowsValue} × ${colsValue}`);
      // Reset input to current grid size
      this.setState({
        customRows: this.state.numRows,
        customCols: this.state.numColumns,
      });
      return;
    }
    
    const rows = rowsValue;
    const cols = colsValue;
    
    // Calculate optimal cell size to fit the screen
    // Reserve space for navbar (~130px top) and some padding (20px)
    const availableWidth = window.innerWidth - 30; // 15px padding each side
    const availableHeight = window.innerHeight - 150; // navbar + padding
    
    // Calculate cell size based on available space
    const maxCellWidth = Math.floor(availableWidth / cols);
    const maxCellHeight = Math.floor(availableHeight / rows);
    
    // Use the smaller dimension to ensure grid fits both width and height
    // Also cap at reasonable max (30px) and min (10px) for usability
    const optimalCellSize = Math.min(Math.max(Math.min(maxCellWidth, maxCellHeight), 10), 30);
    
    // Update start/finish positions for new grid
    const newStartFinish = getStartFinishNode(rows, cols);
    startNodeRow = newStartFinish[0];
    startNodeCol = newStartFinish[1];
    finishNodeRow = newStartFinish[2];
    finishNodeCol = newStartFinish[3];
    
    const newGrid = getInitialGrid(rows, cols);
    this.setState({
      numRows: rows,
      numColumns: cols,
      customRows: rows,
      customCols: cols,
      cellSize: optimalCellSize,
      grid: newGrid,
    });
  };

  updateCustomRows = (value) => {
    // Allow empty string or any value for flexible input
    // Validation will happen on apply
    this.setState({ customRows: value });
  };

  updateCustomCols = (value) => {
    // Allow empty string or any value for flexible input
    // Validation will happen on apply
    this.setState({ customCols: value });
  };

  toggleSkipAnimation = () => {
    this.setState({ skipAnimation: !this.state.skipAnimation });
  };

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    const grid = getInitialGrid(this.state.numRows, this.state.numColumns);
    this.setState({ grid });
  }

  handleMouseDown(row, col) {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }

    // Handle setting start/finish node mode
    if (this.state.settingMode === 'start') {
      this.setStartNode(row, col);
      return;
    }
    
    if (this.state.settingMode === 'finish') {
      this.setFinishNode(row, col);
      return;
    }

    // Normal wall toggle behavior
    const newGrid = getNewGridWithWalls(this.state.grid, row, col);
    this.setState({ grid: newGrid, mouseIsPressed: true });
  }

  handleMouseEnter(row, col) {
    if (this.state.mouseIsPressed) {
      const newGrid = getNewGridWithWalls(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  clearGrid() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    for (let row = 0; row < this.state.grid.length; row++) {
      for (let col = 0; col < this.state.grid[0].length; col++) {
        if (
          !(
            (row === startNodeRow && col === startNodeCol) ||
            (row === finishNodeRow && col === finishNodeCol)
          )
        ) {
          document.getElementById(`node-${row}-${col}`).className = "node";
        }
      }
    }
    const newGrid = getInitialGrid(this.state.numRows, this.state.numColumns);
    this.setState({
      grid: newGrid,
      visualizingAlgorithm: false,
      generatingMaze: false,
    });
  }

  clearPath() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    for (let row = 0; row < this.state.grid.length; row++) {
      for (let col = 0; col < this.state.grid[0].length; col++) {
        const element = document.getElementById(`node-${row}-${col}`);
        if (
          element.className === "node node-shortest-path" ||
          element.className === "node node-intersection"
        ) {
          element.className = "node";
        }
      }
    }
    const newGrid = getGridWithoutPath(this.state.grid);
    this.setState({
      grid: newGrid,
      visualizingAlgorithm: false,
      generatingMaze: false,
    });
  }

  animateShortestPath = (nodesInShortestPathOrder, visitedNodesInOrder, algorithmName = 'Algorithm', maxMemoryUsage = 0) => {
    if (nodesInShortestPathOrder.length === 1)
      this.setState({ visualizingAlgorithm: false });

    // Skip animation mode - show results immediately
    if (this.state.skipAnimation) {
      let newGrid = updateNodesForRender(
        this.state.grid,
        nodesInShortestPathOrder,
        visitedNodesInOrder
      );
      
      // Update grid with distances immediately - including start node
      for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
        let node = nodesInShortestPathOrder[i];
        if (newGrid[node.row] && newGrid[node.row][node.col]) {
          newGrid[node.row][node.col].distance = node.distance;
        }
        
        // Only update CSS classes for non-start/finish nodes
        if (i > 0 && !(node.row === finishNodeRow && node.col === finishNodeCol)) {
          if (node.isIntersection) {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node node-intersection";
          } else {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              "node node-shortest-path";
          }
        }
      }
      
      // Show finish node distance immediately (if path found)
      if (nodesInShortestPathOrder.length > 1) {
        const finishNode = nodesInShortestPathOrder[nodesInShortestPathOrder.length - 1];
        if (finishNode && newGrid[finishNode.row] && newGrid[finishNode.row][finishNode.col]) {
          newGrid[finishNode.row][finishNode.col].distance = finishNode.distance;
        }
      }

      this.setState({ grid: newGrid, visualizingAlgorithm: false });
      
      // Calculate and show results immediately
      const pathLength = nodesInShortestPathOrder.length > 1 ? nodesInShortestPathOrder.length - 1 : 0;
      const visitedNodes = nodesInShortestPathOrder.length > 1 ? visitedNodesInOrder.length + 1 : visitedNodesInOrder.length;
      const memoryUsage = maxMemoryUsage;
      
      this.showAlgorithmResults(algorithmName, pathLength, visitedNodes, memoryUsage);
      return;
    }

    // Normal animation
    for (let i = 1; i < nodesInShortestPathOrder.length; i++) {
      if (i === nodesInShortestPathOrder.length - 1) {
        setTimeout(() => {
          let newGrid = updateNodesForRender(
            this.state.grid,
            nodesInShortestPathOrder,
            visitedNodesInOrder
          );
          this.setState({ grid: newGrid, visualizingAlgorithm: false });
          
          // Calculate and show results
          const pathLength = nodesInShortestPathOrder.length > 1 ? nodesInShortestPathOrder.length - 1 : 0;
          // Add 1 to visited nodes count if path was found (finish node reached)
          const visitedNodes = nodesInShortestPathOrder.length > 1 ? visitedNodesInOrder.length + 1 : visitedNodesInOrder.length;
          const memoryUsage = maxMemoryUsage;
          
          // Show results overlay after a short delay
          setTimeout(() => {
            this.showAlgorithmResults(algorithmName, pathLength, visitedNodes, memoryUsage);
          }, 500);
        }, i * (3 * this.state.speed));
        return;
      }
      
      let node = nodesInShortestPathOrder[i];
      setTimeout(() => {
        let currentGrid = this.state.grid.slice();
        let newNode = {
            ...currentGrid[node.row][node.col],
            distance: node.distance,
          };
        currentGrid[node.row][node.col] = newNode;
        // Show finish node distance on first shortest path animation step
        if (i === 1) {
          const finishNode = nodesInShortestPathOrder[nodesInShortestPathOrder.length - 1];
          let currentGrid = this.state.grid.slice();
          if (finishNode && currentGrid[finishNode.row] && currentGrid[finishNode.row][finishNode.col]) {
            console.log('Setting finish node distance:', finishNode.distance);
            currentGrid[finishNode.row][finishNode.col].distance = finishNode.distance;
          }

          // Show intersection nodes when shortest path animation starts
          for (let pathNode of nodesInShortestPathOrder) {
            if (pathNode.isIntersection && currentGrid[pathNode.row] && currentGrid[pathNode.row][pathNode.col]) {
              document.getElementById(`node-${pathNode.row}-${pathNode.col}`).className =
                "node node-intersection";
            }
          }
        }
        this.setState({ grid: currentGrid });
        //shortest path node - but not if it's an intersection node
        if (!node.isIntersection) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-shortest-path";
        }
      }, i * (3 * this.state.speed));
    }
  };

  animateAlgorithm = (visitedNodesInOrder, nodesInShortestPathOrder, algorithmType = 'default', maxMemoryUsage = 0) => {
    let newGrid = this.state.grid.slice();
    for (let row of newGrid) {
      for (let node of row) {
        let newNode = {
          ...node,
          isVisited: false,
        };
        newGrid[node.row][node.col] = newNode;
      }
    }

    // Update distance values from visited nodes (algorithm-specific)
    // Skip for DFS as it only shows distance when reaching destination (like finishNode)
    if (algorithmType !== 'DFS') {
      for (let visitedNode of visitedNodesInOrder) {
        if (visitedNode && newGrid[visitedNode.row] && newGrid[visitedNode.row][visitedNode.col]) {
          // Skip finish node completely
          if (!(visitedNode.row === finishNodeRow && visitedNode.col === finishNodeCol)) {
            newGrid[visitedNode.row][visitedNode.col].distance = visitedNode.distance;
          }
        }
      }
    }

    // Ensure finish node distance is reset to Infinity
    if (newGrid[finishNodeRow] && newGrid[finishNodeRow][finishNodeCol]) {
      newGrid[finishNodeRow][finishNodeCol].distance = Infinity;
    }

    // For DFS: reset distance of all nodes in shortest path to Infinity
    // So they don't show distance until shortest path animation starts
    if (algorithmType === 'DFS') {
      for (let pathNode of nodesInShortestPathOrder) {
        if (newGrid[pathNode.row] && newGrid[pathNode.row][pathNode.col]) {
          newGrid[pathNode.row][pathNode.col].distance = Infinity;
        }
      }
    }

    // Skip animation mode - show all visited nodes immediately
    if (this.state.skipAnimation) {
      // Mark all visited nodes immediately, but skip start/finish nodes
      for (let visitedNode of visitedNodesInOrder) {
        if (visitedNode && newGrid[visitedNode.row] && newGrid[visitedNode.row][visitedNode.col]) {
          newGrid[visitedNode.row][visitedNode.col].isVisited = true;
          
          // Only update CSS for non-start/finish nodes
          if (!(visitedNode.row === startNodeRow && visitedNode.col === startNodeCol) && 
              !(visitedNode.row === finishNodeRow && visitedNode.col === finishNodeCol)) {
            document.getElementById(`node-${visitedNode.row}-${visitedNode.col}`).className =
              "node node-visited";
          }
        }
      }
      
      this.setState({ grid: newGrid });
      
      // Proceed directly to shortest path
      this.animateShortestPath(
        nodesInShortestPathOrder,
        visitedNodesInOrder,
        algorithmType === 'DFS' ? 'Depth First Search' : this.currentAlgorithmName || 'Algorithm',
        maxMemoryUsage
      );
      return;
    }

    // Normal animation
    this.setState({ grid: newGrid });

    for (let i = 1; i <= visitedNodesInOrder.length; i++) {
      let node = visitedNodesInOrder[i];
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(
            nodesInShortestPathOrder,
            visitedNodesInOrder,
            algorithmType === 'DFS' ? 'Depth First Search' : this.currentAlgorithmName || 'Algorithm',
            maxMemoryUsage
          );
        }, i * this.state.speed);
        return;
      }
      setTimeout(() => {
        // Update grid state to mark node as visited
        let currentGrid = this.state.grid.slice();
        if (node && currentGrid[node.row] && currentGrid[node.row][node.col]) {
          currentGrid[node.row][node.col].isVisited = true;
          this.setState({ grid: currentGrid });
        }

        //visited node CSS
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, i * this.state.speed);
    }
  };

  animateBidirectionalAlgorithm(
    visitedNodesInOrderStart,
    visitedNodesInOrderFinish,
    nodesInShortestPathOrder,
    isShortedPath
  ) {
    // Pre-set distance values for all visited nodes (similar to animateAlgorithm)
    let newGrid = this.state.grid.slice();
    for (let row of newGrid) {
      for (let node of row) {
        let newNode = {
          ...node,
          isVisited: false,
          isIntersection: false,
        };
        newGrid[node.row][node.col] = newNode;
      }
    }
    
    // Update distance values for visited nodes from both sides
    for (let visitedNode of visitedNodesInOrderStart) {
      if (visitedNode && newGrid[visitedNode.row] && newGrid[visitedNode.row][visitedNode.col]) {
        if (!(visitedNode.row === finishNodeRow && visitedNode.col === finishNodeCol)) {
          newGrid[visitedNode.row][visitedNode.col].distance = visitedNode.distance;
        }
      }
    }
    
    for (let visitedNode of visitedNodesInOrderFinish) {
      if (visitedNode && newGrid[visitedNode.row] && newGrid[visitedNode.row][visitedNode.col]) {
        if (!(visitedNode.row === finishNodeRow && visitedNode.col === finishNodeCol)) {
          newGrid[visitedNode.row][visitedNode.col].distance = visitedNode.distance;
        }
      }
    }
    
    // Ensure finish node distance is reset to Infinity
    if (newGrid[finishNodeRow] && newGrid[finishNodeRow][finishNodeCol]) {
      newGrid[finishNodeRow][finishNodeCol].distance = Infinity;
    }
    
    this.setState({ grid: newGrid });
    
    // Skip animation mode - show all visited nodes immediately
    if (this.state.skipAnimation) {
      // Mark all visited nodes from both sides immediately
      for (let visitedNode of visitedNodesInOrderStart) {
        if (visitedNode && newGrid[visitedNode.row] && newGrid[visitedNode.row][visitedNode.col]) {
          newGrid[visitedNode.row][visitedNode.col].isVisited = true;
          
          // Only update CSS for non-start/finish nodes
          if (!(visitedNode.row === startNodeRow && visitedNode.col === startNodeCol) && 
              !(visitedNode.row === finishNodeRow && visitedNode.col === finishNodeCol)) {
            document.getElementById(`node-${visitedNode.row}-${visitedNode.col}`).className =
              "node node-visited";
          }
        }
      }
      
      for (let visitedNode of visitedNodesInOrderFinish) {
        if (visitedNode && newGrid[visitedNode.row] && newGrid[visitedNode.row][visitedNode.col]) {
          newGrid[visitedNode.row][visitedNode.col].isVisited = true;
          
          // Only update CSS for non-start/finish nodes
          if (!(visitedNode.row === startNodeRow && visitedNode.col === startNodeCol) && 
              !(visitedNode.row === finishNodeRow && visitedNode.col === finishNodeCol)) {
            document.getElementById(`node-${visitedNode.row}-${visitedNode.col}`).className =
              "node node-visited";
          }
        }
      }
      
      this.setState({ grid: newGrid });
      
      // Proceed directly to shortest path
      let visitedNodesInOrder = getVisitedNodesInOrder(
        visitedNodesInOrderStart,
        visitedNodesInOrderFinish
      );
      if (isShortedPath) {
        this.animateShortestPath(
          nodesInShortestPathOrder,
          visitedNodesInOrder,
          'Bidirectional Greedy Search',
          this.bidirectionalMaxMemoryUsage || visitedNodesInOrder.length
        );
      } else {
        this.setState({ visualizingAlgorithm: false });
      }
      return;
    }
    
    // Normal animation
    let len = Math.max(
      visitedNodesInOrderStart.length,
      visitedNodesInOrderFinish.length
    );
    for (let i = 1; i <= len; i++) {
      let nodeA = visitedNodesInOrderStart[i];
      let nodeB = visitedNodesInOrderFinish[i];
      if (i === visitedNodesInOrderStart.length) {
        setTimeout(() => {
          let visitedNodesInOrder = getVisitedNodesInOrder(
            visitedNodesInOrderStart,
            visitedNodesInOrderFinish
          );
          if (isShortedPath) {
            this.animateShortestPath(
              nodesInShortestPathOrder,
              visitedNodesInOrder,
              'Bidirectional Greedy Search',
              this.bidirectionalMaxMemoryUsage || visitedNodesInOrder.length
            );
          } else {
            this.setState({ visualizingAlgorithm: false });
          }
        }, i * this.state.speed);
        return;
      }
      setTimeout(() => {
        // Update grid state to mark nodes as visited (similar to animateAlgorithm)
        let currentGrid = this.state.grid.slice();
        
        //visited nodes
        if (nodeA !== undefined) {
          if (currentGrid[nodeA.row] && currentGrid[nodeA.row][nodeA.col]) {
            currentGrid[nodeA.row][nodeA.col].isVisited = true;
          }
          document.getElementById(`node-${nodeA.row}-${nodeA.col}`).className =
            "node node-visited";
        }
        if (nodeB !== undefined) {
          if (currentGrid[nodeB.row] && currentGrid[nodeB.row][nodeB.col]) {
            currentGrid[nodeB.row][nodeB.col].isVisited = true;
          }
          document.getElementById(`node-${nodeB.row}-${nodeB.col}`).className =
            "node node-visited";
        }
        
        this.setState({ grid: currentGrid });
      }, i * this.state.speed);
    }
  }

  // Functions to set start/finish node positions
  setStartNode = (row, col) => {
    if (this.state.grid[row][col].isWall || (row === finishNodeRow && col === finishNodeCol)) {
      return; // Can't place start node on wall or finish node
    }

    // Clear any existing path first
    this.clearPath();

    const oldGrid = this.state.grid.slice();
    
    // Remove old start node
    if (oldGrid[startNodeRow] && oldGrid[startNodeRow][startNodeCol]) {
      oldGrid[startNodeRow][startNodeCol] = {
        ...oldGrid[startNodeRow][startNodeCol],
        isStart: false,
        distance: Infinity
      };
    }

    // Set new start node
    if (oldGrid[row] && oldGrid[row][col]) {
      oldGrid[row][col] = {
        ...oldGrid[row][col],
        isStart: true,
        distance: 0
      };
    }

    // Update global variables
    startNodeRow = row;
    startNodeCol = col;

    this.setState({ grid: oldGrid, settingMode: null });
  };

  setFinishNode = (row, col) => {
    if (this.state.grid[row][col].isWall || (row === startNodeRow && col === startNodeCol)) {
      return; // Can't place finish node on wall or start node
    }

    // Clear any existing path first
    this.clearPath();

    const oldGrid = this.state.grid.slice();
    
    // Remove old finish node
    if (oldGrid[finishNodeRow] && oldGrid[finishNodeRow][finishNodeCol]) {
      oldGrid[finishNodeRow][finishNodeCol] = {
        ...oldGrid[finishNodeRow][finishNodeCol],
        isFinish: false
      };
    }

    // Set new finish node
    if (oldGrid[row] && oldGrid[row][col]) {
      oldGrid[row][col] = {
        ...oldGrid[row][col],
        isFinish: true
      };
    }

    // Update global variables
    finishNodeRow = row;
    finishNodeCol = col;

    this.setState({ grid: oldGrid, settingMode: null });
  };

  // Functions to activate setting modes
  activateSetStartMode = () => {
    this.setState({ settingMode: 'start' });
  };

  activateSetFinishMode = () => {
    this.setState({ settingMode: 'finish' });
  };

  cancelSettingMode = () => {
    this.setState({ settingMode: null });
  };

  visualizeDijkstra() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    this.currentAlgorithmName = "Dijkstra's Algorithm";
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderDijkstra(
        finishNode
      );
      // Use actual memory usage tracked in algorithm
      const maxMemoryUsage = visitedNodesInOrder.maxMemoryUsage || 0;
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, 'default', maxMemoryUsage);
    }, this.state.speed);
  }

  visualizeAStar(metricType = 'manhattan', weight = 1) {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    this.currentAlgorithmName = "A* Search";
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = astar(grid, startNode, finishNode, metricType, weight);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderAstar(
        finishNode
      );
      // Use actual memory usage tracked in algorithm
      const maxMemoryUsage = visitedNodesInOrder.maxMemoryUsage || 0;
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, 'default', maxMemoryUsage);
    }, this.state.speed);
  }

  visualizeBFS() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    this.currentAlgorithmName = "Breadth First Search";
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = breadthFirstSearch(
        grid,
        startNode,
        finishNode
      );
      const nodesInShortestPathOrder = getNodesInShortestPathOrderBFS(
        finishNode
      );
      // Use actual memory usage tracked in algorithm
      const maxMemoryUsage = visitedNodesInOrder.maxMemoryUsage || 0;
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, 'default', maxMemoryUsage);
    }, this.state.speed);
  }

  visualizeDFS() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = depthFirstSearch(grid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderDFS(
        finishNode
      );
      // Use actual memory usage tracked in algorithm
      const maxMemoryUsage = visitedNodesInOrder.maxMemoryUsage || 0;
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, 'DFS', maxMemoryUsage);
    }, this.state.speed);
  }

  visualizeGreedyBFS(metricType = 'manhattan', weight = 1) {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    this.currentAlgorithmName = "Greedy Best First Search";
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = greedyBFS(grid, startNode, finishNode, metricType, weight);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderGreedyBFS(
        finishNode
      );
      // Use actual memory usage tracked in algorithm
      const maxMemoryUsage = visitedNodesInOrder.maxMemoryUsage || 0;
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, 'default', maxMemoryUsage);
    }, this.state.speed);
  }

  visualizeBidirectionalGreedySearch(metricType = 'manhattan', weight = 1) {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = bidirectionalGreedySearch(
        grid,
        startNode,
        finishNode,
        metricType,
        weight
      );
      const visitedNodesInOrderStart = visitedNodesInOrder[0];
      const visitedNodesInOrderFinish = visitedNodesInOrder[1];
      const isShortedPath = visitedNodesInOrder[2];
      const nodesInShortestPathOrder = getNodesInShortestPathOrderBidirectionalGreedySearch(
        visitedNodesInOrderStart[visitedNodesInOrderStart.length - 1],
        visitedNodesInOrderFinish[visitedNodesInOrderFinish.length - 1]
      );
      // Use actual memory usage tracked in algorithm
      this.bidirectionalMaxMemoryUsage = visitedNodesInOrderStart.maxMemoryUsage || 0;
      this.animateBidirectionalAlgorithm(
        visitedNodesInOrderStart,
        visitedNodesInOrderFinish,
        nodesInShortestPathOrder,
        isShortedPath
      );
    }, this.state.speed);
  }

  animateMaze = (walls) => {
    for (let i = 0; i <= walls.length; i++) {
      if (i === walls.length) {
        setTimeout(() => {
          this.clearGrid();
          let newGrid = getNewGridWithMaze(this.state.grid, walls);
          this.setState({ grid: newGrid, generatingMaze: false });
        }, i * this.state.mazeSpeed);
        return;
      }
      let wall = walls[i];
      let node = this.state.grid[wall[0]][wall[1]];
      setTimeout(() => {
        //Walls
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-wall-animated";
      }, i * this.state.mazeSpeed);
    }
  };

  generateRandomMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = randomMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  generateRecursiveDivisionMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = recursiveDivisionMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  generateVerticalMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = verticalMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  generateHorizontalMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = horizontalMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  // Add function to show results overlay
  showAlgorithmResults = (algorithmName, pathLength, visitedNodes, memoryUsage) => {
    this.setState({
      showResults: true,
      algorithmResults: {
        algorithmName,
        pathLength,
        visitedNodes,
        memoryUsage
      }
    });
  };

  // Add function to hide results overlay
  hideAlgorithmResults = () => {
    this.setState({ showResults: false });
  };

  // Add fixed left panel for results
  renderResultsOverlay = () => {
    if (!this.state.showResults) return null;
    
    const { algorithmName, pathLength, visitedNodes, memoryUsage } = this.state.algorithmResults;
    
    return (
      <div className="results-panel-left">
        <div className="results-header-fixed">
          <h3>Algorithm Results</h3>
          <button 
            className="close-results-btn"
            onClick={this.hideAlgorithmResults}
            title="Close results"
          >
            ×
          </button>
        </div>
        
        <div className="results-content-fixed">
          <div className="result-item">
            <span className="result-label">Algorithm:</span>
            <span className="result-value">{algorithmName}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Path Length:</span>
            <span className="result-value">{pathLength}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Visited Nodes:</span>
            <span className="result-value">{visitedNodes}</span>
          </div>
          <div className="result-item">
            <span className="result-label">Memory Usage:</span>
            <span className="result-value">{memoryUsage}</span>
          </div>
        </div>
      </div>
    );
  };

  render() {
    let { grid } = this.state;
    return (
      <React.Fragment>
        <NavBar
          visualizingAlgorithm={this.state.visualizingAlgorithm}
          generatingMaze={this.state.generatingMaze}
          showDistances={this.state.showDistances}
          skipAnimation={this.state.skipAnimation}
          settingMode={this.state.settingMode}
          gridSizeMode={this.state.gridSizeMode}
          customRows={this.state.customRows}
          customCols={this.state.customCols}
          numRows={this.state.numRows}
          numColumns={this.state.numColumns}
          visualizeDijkstra={this.visualizeDijkstra.bind(this)}
          visualizeAStar={this.visualizeAStar.bind(this)}
          visualizeGreedyBFS={this.visualizeGreedyBFS.bind(this)}
          visualizeBidirectionalGreedySearch={this.visualizeBidirectionalGreedySearch.bind(
            this
          )}
          visualizeBFS={this.visualizeBFS.bind(this)}
          visualizeDFS={this.visualizeDFS.bind(this)}
          generateRandomMaze={this.generateRandomMaze.bind(this)}
          generateRecursiveDivisionMaze={this.generateRecursiveDivisionMaze.bind(
            this
          )}
          generateVerticalMaze={this.generateVerticalMaze.bind(this)}
          generateHorizontalMaze={this.generateHorizontalMaze.bind(this)}
          clearGrid={this.clearGrid.bind(this)}
          clearPath={this.clearPath.bind(this)}
          updateSpeed={this.updateSpeed.bind(this)}
          toggleDistanceMode={this.toggleDistanceMode.bind(this)}
          toggleSkipAnimation={this.toggleSkipAnimation.bind(this)}
          activateSetStartMode={this.activateSetStartMode.bind(this)}
          activateSetFinishMode={this.activateSetFinishMode.bind(this)}
          cancelSettingMode={this.cancelSettingMode.bind(this)}
          setGridSizeMode={this.setGridSizeMode.bind(this)}
          applyCustomGridSize={this.applyCustomGridSize.bind(this)}
          updateCustomRows={this.updateCustomRows.bind(this)}
          updateCustomCols={this.updateCustomCols.bind(this)}
        />
        <div
          className={
            this.state.visualizingAlgorithm || this.state.generatingMaze
              ? "grid-visualizing"
              : `grid${this.state.settingMode ? ' setting-mode-active' : ''}${this.state.settingMode === 'start' ? ' setting-mode-start' : ''}${this.state.settingMode === 'finish' ? ' setting-mode-finish' : ''}`
          }
          style={this.state.gridSizeMode === 'custom' ? { display: 'inline-block' } : {}}
        >
          {grid.map((row, rowId) => {
            return (
              <div key={rowId} style={{ whiteSpace: 'nowrap' }}>
                {row.map((node, nodeId) => {
                  const {
                    row,
                    col,
                    isStart,
                    isFinish,
                    isVisited,
                    isShortest,
                    isWall,
                    isIntersection,
                    distance,
                  } = node;
                  return (
                    <Node
                      key={nodeId}
                      row={row}
                      col={col}
                      isStart={isStart}
                      isFinish={isFinish}
                      isVisited={isVisited}
                      isShortest={isShortest}
                      isWall={isWall}
                      isIntersection={isIntersection}
                      distance={distance}
                      showDistances={this.state.showDistances}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      width={this.state.width}
                      height={this.state.height}
                      numRows={this.state.numRows}
                      numColumns={this.state.numColumns}
                      gridSizeMode={this.state.gridSizeMode}
                      cellSize={this.state.cellSize}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
        {this.renderResultsOverlay()}
      </React.Fragment>
    );
  }
}

function getInitialNum(width, height) {
  // Adjust for left panel (320px) and right margin (20px)
  const availableWidth = width - 360;
  const availableHeight = height - 180;
  
  // Fixed cell size for smaller, more uniform cells
  const cellSize = 18;
  
  let numColumns = Math.floor(availableWidth / cellSize);
  let numRows = Math.floor(availableHeight / cellSize);
  
  // Default to 40 columns and 20 rows (max limits)
  numColumns = Math.min(numColumns, 40);
  numRows = Math.min(numRows, 20);
  
  return [numRows, numColumns];
}

function getRandomNums(num) {
  let randomNums1 = [];
  let temp = 2;
  for (let i = 5; i < num / 2; i += 2) {
    randomNums1.push(temp);
    temp += 2;
  }
  let randomNums2 = [];
  temp = -2;
  for (let i = num / 2; i < num - 5; i += 2) {
    randomNums2.push(temp);
    temp -= 2;
  }
  return [randomNums1, randomNums2];
}

function getStartFinishNode(numRows, numColumns) {
  let randomNums;
  let x;
  let y;
  let startNodeRow;
  let startNodeCol;
  let finishNodeRow;
  let finishNodeCol;
  if (numRows < numColumns) {
    randomNums = getRandomNums(numRows);
    x = Math.floor(numRows / 2);
    y = Math.floor(numColumns / 4);
    if (x % 2 !== 0) x -= 1;
    if (y % 2 !== 0) y += 1;
    startNodeRow =
      x + randomNums[1][Math.floor(Math.random() * randomNums[1].length)];
    startNodeCol = y + [-6, -4, -2, 0][Math.floor(Math.random() * 4)];
    finishNodeRow =
      x + randomNums[0][Math.floor(Math.random() * randomNums[0].length)];
    finishNodeCol =
      numColumns - y + [0, 2, 4, 6][Math.floor(Math.random() * 4)];
  } else {
    randomNums = getRandomNums(numColumns);
    x = Math.floor(numRows / 4);
    y = Math.floor(numColumns / 2);
    if (x % 2 !== 0) x -= 1;
    if (y % 2 !== 0) y += 1;
    startNodeRow = x + [-6, -4, -2, 0][Math.floor(Math.random() * 4)];
    startNodeCol =
      y + randomNums[1][Math.floor(Math.random() * randomNums[1].length)];
    finishNodeRow = numRows - x + [0, 2, 4, 6][Math.floor(Math.random() * 4)];
    finishNodeCol =
      y + randomNums[0][Math.floor(Math.random() * randomNums[0].length)];
  }
  return [startNodeRow, startNodeCol, finishNodeRow, finishNodeCol];
}

const getInitialGrid = (numRows, numColumns) => {
  let grid = [];
  for (let row = 0; row < numRows; row++) {
    let currentRow = [];
    for (let col = 0; col < numColumns; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (row, col) => {
  const isStart = row === startNodeRow && col === startNodeCol;
  return {
    row,
    col,
    isStart: isStart,
    isFinish: row === finishNodeRow && col === finishNodeCol,
    distance: isStart ? 0 : Infinity, // Start node gets distance 0 immediately
    totalDistance: Infinity,
    isVisited: false,
    isShortest: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWalls = (grid, row, col) => {
  let newGrid = grid.slice();
  let node = grid[row][col];
  
  // Prevent start and finish nodes from being turned into walls
  if (node.isStart || node.isFinish) {
    return newGrid;
  }
  
  let newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithMaze = (grid, walls) => {
  let newGrid = grid.slice();
  for (let wall of walls) {
    let node = grid[wall[0]][wall[1]];
    let newNode = {
      ...node,
      isWall: true,
    };
    newGrid[wall[0]][wall[1]] = newNode;
  }
  return newGrid;
};

const getGridWithoutPath = (grid) => {
  let newGrid = grid.slice();
  for (let row of grid) {
    for (let node of row) {
      const isStart = node.row === startNodeRow && node.col === startNodeCol;
      let newNode = {
        ...node,
        distance: isStart ? 0 : Infinity, // Start node gets distance 0
        totalDistance: Infinity,
        isVisited: false,
        isShortest: false,
        isIntersection: false, // Reset intersection status
        previousNode: null,
      };
      newGrid[node.row][node.col] = newNode;
    }
  }
  return newGrid;
};

const updateNodesForRender = (
  grid,
  nodesInShortestPathOrder,
  visitedNodesInOrder
) => {
  let newGrid = grid.slice();
  for (let node of visitedNodesInOrder) {
    if (
      (node.row === startNodeRow && node.col === startNodeCol) ||
      (node.row === finishNodeRow && node.col === finishNodeCol)
    )
      continue;
    let newNode = {
      ...node,
      isVisited: true,
    };
    newGrid[node.row][node.col] = newNode;
  }
  for (let node of nodesInShortestPathOrder) {
    if (node.row === finishNodeRow && node.col === finishNodeCol) {
      return newGrid;
    }
    // Don't change intersection nodes to shortest path
    if (node.isIntersection) {
      continue;
    }
    let newNode = {
      ...node,
      isVisited: false,
      isShortest: true,
    };
    newGrid[node.row][node.col] = newNode;
  }
  return newGrid;
};

const getVisitedNodesInOrder = (
  visitedNodesInOrderStart,
  visitedNodesInOrderFinish
) => {
  let visitedNodesInOrder = [];
  let n = Math.max(
    visitedNodesInOrderStart.length,
    visitedNodesInOrderFinish.length
  );
  for (let i = 0; i < n; i++) {
    if (visitedNodesInOrderStart[i] !== undefined) {
      visitedNodesInOrder.push(visitedNodesInOrderStart[i]);
    }
    if (visitedNodesInOrderFinish[i] !== undefined) {
      visitedNodesInOrder.push(visitedNodesInOrderFinish[i]);
    }
  }
  return visitedNodesInOrder;
};

export default PathfindingVisualizer;

/* <button className="button" onClick={() => this.visualizeDijkstra()}>
Dijkstra's
</button>
&nbsp;
<button className="button" onClick={() => this.visualizeAStar()}>
A Star
</button>
&nbsp;
<button className="button" onClick={() => this.visualizeBFS()}>
Breadth First Search
</button>
&nbsp;
<button className="button" onClick={() => this.visualizeDFS()}>
Depth First Search
</button>
&nbsp;
<button className="button" onClick={() => this.clearGrid()}>
Clear Grid
</button>
<br />
<button className="button" onClick={() => this.visualizeGreedyBFS()}>
Greedy Best First Search
</button>
&nbsp;
<button
className="button"
onClick={() => this.visualizeBidirectionalGreedySearch()}
>
Bidirectional Best First Search
</button>
&nbsp;
<button className="button" onClick={() => this.generateRandomMaze()}>
Random Maze
</button>
&nbsp;
<button
className="button"
onClick={() => this.generateRecursiveDivisionMaze()}
>
Recursive Division
</button>
&nbsp;
<button
className="button"
onClick={() => this.generateVerticalMaze()}
>
Vertical Maze
</button>
&nbsp;
<button
className="button"
onClick={() => this.generateHorizontalMaze()}
>
Horizontal Maze
</button>
 */