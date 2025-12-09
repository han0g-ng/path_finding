import React, { Component } from "react";
import "./node.css";

class Node extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      row,
      col,
      isStart,
      isFinish,
      isWall,
      isVisited,
      isShortest,
      isIntersection,
      distance,
      showDistances,
      onMouseEnter,
      onMouseDown,
      onMouseUp,
      width,
      height,
      numRows,
      numColumns,
      gridSizeMode,
      cellSize,
    } = this.props;

    const extraClass = isIntersection
      ? "node node-intersection"
      : isStart
      ? "node node-start"
      : isFinish
      ? "node node-finish"
      : isWall
      ? "node-wall"
      : isShortest
      ? "node node-shortest-path"
      : isVisited
      ? "node node-visited"
      : "node";

    // Fixed cell size - no more dynamic calculation
    const FIXED_CELL_SIZE = 27;
    let cellWidth = FIXED_CELL_SIZE;
    let cellHeight = FIXED_CELL_SIZE;

    // Simple logic: 
    // - Start node: always show (distance = 0)
    // - Visited nodes: show when visited
    // - Finish node: show when has valid distance (algorithm reached it)
    // - Never show Infinity
    const shouldShowDistance = showDistances && 
      (isStart || isVisited || isShortest || (isFinish && distance !== Infinity && distance !== undefined && distance >= 0));
    const displayDistance = (shouldShowDistance && distance !== Infinity && distance !== undefined && distance >= 0) ? distance : '';

    return (
      <div
        id={`node-${row}-${col}`}
        className={`${extraClass}`}
        style={{ "--width": `${cellWidth}px`, "--height": `${cellHeight}px` }}
        onMouseEnter={() => onMouseEnter(row, col)}
        onMouseDown={() => onMouseDown(row, col)}
        onMouseUp={() => onMouseUp()}
      >
        {shouldShowDistance && displayDistance !== '' && displayDistance !== undefined && displayDistance !== Infinity && (
          <span className="node-distance">{displayDistance}</span>
        )}
      </div>
    );
  }
}

export default Node;