import React, { Component } from "react";
import "./navbar.css";

class NavBar extends Component {
  state = {
    algorithm: "Visualize Algorithm",
    maze: "Generate Maze",
    pathState: false,
    mazeState: false,
    speedState: "Speed",
    showAlgorithmDropdown: false,
    showMazeDropdown: false,
    showSpeedDropdown: false,
    showMetricDropdown: false,
    metricState: "Metric Space",
    heuristicWeight: 1.0,
    showAdvancedOptions: false, // Sidebar ẩn mặc định
  };

  toggleDropdown = (type) => {
    this.setState({
      showAlgorithmDropdown: type === 'algorithm' ? !this.state.showAlgorithmDropdown : false,
      showMazeDropdown: type === 'maze' ? !this.state.showMazeDropdown : false,
      showSpeedDropdown: type === 'speed' ? !this.state.showSpeedDropdown : false,
      showMetricDropdown: type === 'metric' ? !this.state.showMetricDropdown : false,
    });
  };

  selectAlgorithm(selection) {
    if (this.props.visualizingAlgorithm) {
      return;
    }
    if (
      selection === this.state.algorithm ||
      this.state.algorithm === "Visualize Algorithm" ||
      this.state.algorithm === "Select an Algorithm!"
    ) {
      this.setState({ algorithm: selection });
    } else if (this.state.pathState) {
      this.clearPath();
      this.setState({ algorithm: selection });
    } else {
      this.setState({ algorithm: selection });
    }
  }

  selectMaze(selection) {
    if (this.props.visualizingAlgorithm || this.props.generatingMaze) {
      return;
    }
    if (
      selection === this.state.maze ||
      this.state.maze === "Generate Maze" ||
      this.state.maze === "Select a Maze!"
    ) {
      this.setState({ maze: selection });
    } else if (!this.state.mazeState) {
      this.setState({ maze: selection });
    } else {
      this.clearGrid();
      this.setState({ maze: selection });
    }
  }

  updateWeight = (event) => {
    if (this.props.visualizingAlgorithm || this.props.generatingMaze) {
      return;
    }

    const weight = parseFloat(event.target.value);

    // Same logic as selectAlgorithm: if different weight and path exists, clear path but keep walls/maze
    if (weight !== this.state.heuristicWeight && this.state.pathState) {
      this.clearPath();
      this.setState({ heuristicWeight: weight });
    } else {
      this.setState({ heuristicWeight: weight });
    }
  };

  toggleAdvancedOptions = () => {
    this.setState({ showAdvancedOptions: !this.state.showAdvancedOptions });
  };

  visualizeAlgorithm() {
    if (this.props.visualizingAlgorithm || this.props.generatingMaze) {
      return;
    }
    if (this.state.pathState) {
      this.clearPath();
      return;
    }
    if (
      this.state.algorithm === "Visualize Algorithm" ||
      this.state.algorithm === "Select an Algorithm!"
    ) {
      this.setState({ algorithm: "Select an Algorithm!" });
    } else {
      this.setState({ pathState: true });

      // Convert metric name to lowercase for algorithm usage
      const metricType = this.state.metricState.toLowerCase();
      const weight = this.state.heuristicWeight;

      if (this.state.algorithm === "Dijkstra")
        this.props.visualizeDijkstra();
      else if (this.state.algorithm === "A*")
        this.props.visualizeAStar(metricType, weight);
      else if (this.state.algorithm === "Greedy Best First Search")
        this.props.visualizeGreedyBFS(metricType, weight);
      else if (this.state.algorithm === "Bidirectional Greedy")
        this.props.visualizeBidirectionalGreedySearch(metricType, weight);
      else if (this.state.algorithm === "Breadth First Search")
        this.props.visualizeBFS();
      else if (this.state.algorithm === "Depth First Search")
        this.props.visualizeDFS();
    }
  }

  generateMaze() {
    if (this.props.visualizingAlgorithm || this.props.generatingMaze) {
      return;
    }
    if (this.state.mazeState || this.state.pathState) {
      this.clearTemp();
    }
    if (
      this.state.maze === "Generate Maze" ||
      this.state.maze === "Select a Maze!"
    ) {
      this.setState({ maze: "Select a Maze!" });
    } else {
      this.clearTemp();
      this.setState({ mazeState: true });
      if (this.state.maze === "Random Maze")
        this.props.generateRandomMaze();
      else if (this.state.maze === "Recursive Division Maze")
        this.props.generateRecursiveDivisionMaze();
      else if (this.state.maze === "Vertical Division Maze")
        this.props.generateVerticalMaze();
      else if (this.state.maze === "Horizontal Division Maze")
        this.props.generateHorizontalMaze();
    }
  }

  clearGrid() {
    if (this.props.visualizingAlgorithm || this.props.generatingMaze) {
      return;
    }
    this.props.clearGrid();
    this.setState({
      algorithm: "Visualize Algorithm",
      maze: "Generate Maze",
      pathState: false,
      mazeState: false,
    });
  }

  clearPath() {
    if (this.props.visualizingAlgorithm || this.props.generatingMaze) {
      return;
    }
    this.props.clearPath();
    this.setState({
      pathState: false,
      mazeState: false,
    });
  }

  clearTemp() {
    if (this.props.visualizingAlgorithm || this.props.generatingMaze) {
      return;
    }
    this.props.clearGrid();
    this.setState({
      pathState: false,
      mazeState: false,
    });
  }

  changeSpeed(speed) {
    if (this.props.visualizingAlgorithm || this.props.generatingMaze) {
      return;
    }

    let value = [10, 10];
    if (speed === "Slow") value = [50, 30];
    else if (speed === "Medium") value = [25, 20];
    else if (speed === "Fast") value = [10, 10];

    // Same logic as selectAlgorithm: if different speed and path exists, clear path but keep walls/maze
    if (speed !== this.state.speedState && this.state.pathState) {
      this.clearPath();
      this.setState({ speedState: speed });
    } else {
      this.setState({ speedState: speed });
    }

    this.props.updateSpeed(value[0], value[1]);
  }

  selectMetric(metric) {
    if (this.props.visualizingAlgorithm || this.props.generatingMaze) {
      return;
    }

    // Same logic as selectAlgorithm: if different metric and path exists, clear path but keep walls/maze
    if (metric !== this.state.metricState && this.state.pathState) {
      this.clearPath();
      this.setState({ metricState: metric });
    } else {
      this.setState({ metricState: metric });
    }
  }

  render() {
    return (
      <div>
          {/* Dòng 1: Title */}
          <nav className="navbar navbar-expand navbar-dark bg-dark">
            <div className="container-fluid">
              <span className="navbar-brand h1 mb-0">
                Pathfinding Visualizer
              </span>
              <div className="ms-auto d-flex align-items-center">
                <button
                  type="button"
                  className={`btn btn-sm ${this.state.showAdvancedOptions ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={this.toggleAdvancedOptions}
                  title="Toggle settings panel"
                  style={{fontSize: '18px', lineHeight: '1'}}
                >
                  ⋮
                </button>
              </div>
            </div>
          </nav>

        {/* Dòng 2: Algorithm Setup + Config + Maze Setup */}
        <nav className="navbar navbar-expand navbar-dark bg-secondary">
          <div className="container-fluid">
          <div className="navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              {/* === 1. ALGORITHM SETUP === */}
              <li className="nav-item dropdown">
                <div className="dropdown">
                  <button
                    className="btn btn-light dropdown-toggle"
                    type="button"
                    onClick={() => this.toggleDropdown('algorithm')}
                  >
                    {this.state.algorithm === "Visualize Algorithm" ? "Algorithms" : this.state.algorithm}
                  </button>
                  <ul className={`dropdown-menu ${this.state.showAlgorithmDropdown ? 'show' : ''}`}>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectAlgorithm("Dijkstra"); this.toggleDropdown('');}}
                  >
                    Dijkstra's Algorithm
                  </button></li>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectAlgorithm("A*"); this.toggleDropdown('');}}
                  >
                    A* Algorithm
                  </button></li>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectAlgorithm("Greedy Best First Search"); this.toggleDropdown('');}}
                  >
                    Greedy Best First Search
                  </button></li>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectAlgorithm("Bidirectional Greedy"); this.toggleDropdown('');}}
                  >
                    Bidirectional Greedy Search
                  </button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectAlgorithm("Breadth First Search"); this.toggleDropdown('');}}
                  >
                    Breadth First Search
                  </button></li>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectAlgorithm("Depth First Search"); this.toggleDropdown('');}}
                  >
                    Depth First Search
                  </button></li>
                </ul>
                </div>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => this.visualizeAlgorithm()}
                >
                  Visualize
                </button>
              </li>

              {/* === 3. MAZE SETUP === */}
              <li className="nav-item dropdown">
                <div className="dropdown">
                  <button
                    className="btn btn-light dropdown-toggle"
                    type="button"
                    onClick={() => this.toggleDropdown('maze')}
                  >
                    {this.state.maze === "Generate Maze" ? "Mazes" : this.state.maze}
                  </button>
                  <ul className={`dropdown-menu ${this.state.showMazeDropdown ? 'show' : ''}`}>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectMaze("Random Maze"); this.toggleDropdown('');}}
                  >
                    Random Maze
                  </button></li>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectMaze("Recursive Division Maze"); this.toggleDropdown('');}}
                  >
                    Recursive Division Maze
                  </button></li>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectMaze("Vertical Division Maze"); this.toggleDropdown('');}}
                  >
                    Vertical Division Maze
                  </button></li>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectMaze("Horizontal Division Maze"); this.toggleDropdown('');}}
                  >
                    Horizontal Division Maze
                  </button></li>
                </ul>
                </div>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => this.generateMaze()}
                >
                  Generate
                </button>
              </li>

              {/* === RESET BUTTON === */}
              <li className="ms-auto">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => this.clearGrid()}
                >
                  Reset
                </button>
              </li>

              {/* === NODE SETUP === */}
              <li>
                <button
                  type="button"
                  className={`btn ${this.props.settingMode === 'start' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => this.props.settingMode === 'start' ? this.props.cancelSettingMode() : this.props.activateSetStartMode()}
                  disabled={this.props.visualizingAlgorithm || this.props.generatingMaze}
                  title="Click to set new start position"
                >
                  {this.props.settingMode === 'start' ? 'Cancel' : 'Set Start'}
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`btn ${this.props.settingMode === 'finish' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => this.props.settingMode === 'finish' ? this.props.cancelSettingMode() : this.props.activateSetFinishMode()}
                  disabled={this.props.visualizingAlgorithm || this.props.generatingMaze}
                  title="Click to set new finish position"
                >
                  {this.props.settingMode === 'finish' ? 'Cancel' : 'Set Finish'}
                </button>
              </li>

          </ul>
        </div>
      </div>
    </nav>

        {/* Backdrop overlay khi sidebar mở */}
        {this.state.showAdvancedOptions && (
          <div className="sidebar-backdrop" onClick={this.toggleAdvancedOptions}></div>
        )}

        {/* Sidebar: Animation Settings + Node Setup + Reset (Collapsible) */}
        <div className={`advanced-options-sidebar ${this.state.showAdvancedOptions ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="sidebar-content">
            <h6 className="sidebar-title">Advanced Options</h6>
            
            {/* === ALGORITHM SETUP === */}
            <div className="sidebar-section">
              <label className="sidebar-label">Algorithm Setup:</label>
              <div className="dropdown mb-2">
                <button
                  className="btn btn-warning btn-sm dropdown-toggle w-100"
                  type="button"
                  onClick={() => this.toggleDropdown('metric')}
                >
                  {this.state.metricState === "Metric Space" ? "Metric Space" : this.state.metricState}
                </button>
                <ul className={`dropdown-menu ${this.state.showMetricDropdown ? 'show' : ''}`}>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectMetric("Manhattan"); this.toggleDropdown('');}}
                  >
                    Manhattan
                  </button></li>
                  <li><button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {this.selectMetric("Euclidean"); this.toggleDropdown('');}}
                  >
                    Euclidean
                  </button></li>
                </ul>
              </div>

              <div className="d-flex align-items-center mb-3">
                <label className="text-white me-2" style={{fontSize: '0.85rem'}}>Weight:</label>
                <input
                  type="range"
                  className="form-range me-2"
                  min="0"
                  max="10"
                  step="0.1"
                  value={this.state.heuristicWeight}
                  onChange={this.updateWeight}
                  style={{width: "100px"}}
                />
                <span className="text-white" style={{fontSize: '0.85rem'}}>{this.state.heuristicWeight.toFixed(1)}</span>
              </div>
            </div>

            {/* === ANIMATION SETTINGS === */}
            <div className="sidebar-section">
              <label className="sidebar-label">Animation setup:</label>
              <div className="dropdown mb-2">
                <button
                  className="btn btn-success btn-sm dropdown-toggle w-100"
                  type="button"
                  onClick={() => this.toggleDropdown('speed')}
                >
                  {this.state.speedState}
                </button>
                <ul className={`dropdown-menu ${this.state.showSpeedDropdown ? 'show' : ''}`}>
                <li><button
                  className="dropdown-item"
                  type="button"
                  onClick={() => {this.changeSpeed("Slow"); this.toggleDropdown('');}}
                >
                  Slow
                </button></li>
                <li><button
                  className="dropdown-item"
                  type="button"
                  onClick={() => {this.changeSpeed("Medium"); this.toggleDropdown('');}}
                >
                  Medium
                </button></li>
                <li><button
                  className="dropdown-item"
                  type="button"
                  onClick={() => {this.changeSpeed("Fast"); this.toggleDropdown('');}}
                >
                  Fast
                </button></li>
              </ul>
              </div>

              <button
                type="button"
                className={`btn btn-sm w-100 mb-2 ${this.props.skipAnimation ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => this.props.toggleSkipAnimation()}
                disabled={this.props.visualizingAlgorithm || this.props.generatingMaze}
                title="Skip animation and show results immediately"
              >
                {this.props.skipAnimation ? 'Animation ON' : 'Skip Animation'}
              </button>

              <button
                type="button"
                className={`btn btn-sm w-100 mb-3 ${this.props.showDistances ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => this.props.toggleDistanceMode()}
                title="Toggle distance values display on visited nodes"
              >
                {this.props.showDistances ? 'Hide Distances' : 'Show Distances'}
              </button>
            </div>

            {/* === GRID SIZE SETTINGS === */}
            <div className="sidebar-section">
              <label className="sidebar-label">Grid Size:</label>
              
              {/* Mode selector buttons */}
              <div className="d-flex mb-2">
                <button
                  type="button"
                  className={`btn btn-sm flex-fill me-1 ${this.props.gridSizeMode === 'auto' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => this.props.setGridSizeMode('auto')}
                  disabled={this.props.visualizingAlgorithm || this.props.generatingMaze}
                  title="Auto-fit grid to screen size"
                >
                  Auto
                </button>
                <button
                  type="button"
                  className={`btn btn-sm flex-fill ms-1 ${this.props.gridSizeMode === 'custom' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => this.props.setGridSizeMode('custom')}
                  disabled={this.props.visualizingAlgorithm || this.props.generatingMaze}
                  title="Set custom grid dimensions"
                >
                  Custom
                </button>
              </div>

              {/* Current grid size display */}
              <div className="text-white text-center mb-2" style={{fontSize: '0.8rem', opacity: 0.8}}>
                Current: {this.props.numRows} × {this.props.numColumns}
              </div>

              {/* Custom size inputs (only show when custom mode) */}
              {this.props.gridSizeMode === 'custom' && (
                <div className="custom-grid-inputs">
                  <div className="d-flex align-items-center mb-2">
                    <label className="text-white me-2" style={{fontSize: '0.8rem', width: '45px'}}>Rows:</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={this.props.customRows}
                      onChange={(e) => this.props.updateCustomRows(e.target.value)}
                      disabled={this.props.visualizingAlgorithm || this.props.generatingMaze}
                      style={{width: '70px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)'}}
                      placeholder="5-20"
                    />
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <label className="text-white me-2" style={{fontSize: '0.8rem', width: '45px'}}>Cols:</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={this.props.customCols}
                      onChange={(e) => this.props.updateCustomCols(e.target.value)}
                      disabled={this.props.visualizingAlgorithm || this.props.generatingMaze}
                      style={{width: '70px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)'}}
                      placeholder="5-40"
                    />
                  </div>
                  <div className="text-white mb-2" style={{fontSize: '0.7rem', opacity: 0.6, fontStyle: 'italic'}}>
                    Cell size will auto-adjust to fit screen
                  </div>
                  <button
                    type="button"
                    className="btn btn-success btn-sm w-100"
                    onClick={() => this.props.applyCustomGridSize()}
                    disabled={this.props.visualizingAlgorithm || this.props.generatingMaze}
                  >
                    Apply Size
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
  </div>
    );
  }
}
export default NavBar;
