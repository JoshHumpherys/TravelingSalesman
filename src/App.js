import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vertices: [],
      path: []
    };

    this.NUM_VERTICES = 10;
    this.RADIUS = 10;
    this.VERTEX_COLOR = '#0f0';
    this.VERTEX_HOVER_COLOR = '#f00';
    this.VERTEX_SELECTED_COLOR = '#00f';

    this.getDistance = this.getDistance.bind(this);
    this.generateNewVertices = this.generateNewVertices.bind(this);
    this.renderCanvas = this.renderCanvas.bind(this);
    this.reset = this.reset.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
    this.getMouseCoords = this.getMouseCoords.bind(this);
    this.shortestPath = this.shortestPath.bind(this);
    this.shortestPathRecursive = this.shortestPathRecursive.bind(this);
    this.shortestPathOverall = this.shortestPathOverall.bind(this);
    this.calculatePathLength = this.calculatePathLength.bind(this);
  }

  getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  generateNewVertices(n) {
    let generateNewPoint = () => {
      return {
        x: 0.9 * Math.random() + 0.05,
        y: 0.9 * Math.random() + 0.05
      };
    };
    let vertices = [];
    for(let i = 0; i < n; i++) {
      let newPoint;
      for(let j = 0; j < 1000; j++) { // give up after 1000 failed attempts
        newPoint = generateNewPoint();
        let invalid = false;
        for(let v of vertices) {
          if(this.getDistance(newPoint, v) < .2) {
            invalid = true;
            break;
          }
        }
        if(!invalid) {
          break;
        }
      }
      vertices.push({ ...newPoint, id: i, hover: false, selected: false });
    }
    return vertices;
  }

  renderCanvas() {
    let canvas = document.getElementById('canvas');
    let width = canvas.parentElement.clientWidth;
    let height = parseInt(width / 2, 10);
    let oldWidth = canvas.width;
    let oldHeight = canvas.height;
    if(oldWidth !== width || oldHeight !== height) {
      canvas.width = width;
      canvas.height = height;
      this.setState({ canvasWidth: width, canvasHeight: height });
    }

    let c = this.canvas.getContext('2d');
    c.clearRect(0, 0, width, height);
    c.strokeStyle = "#000";

    // draw path
    if(this.state.path.length > 1) {
      let getCoordsFromVertexId = id => {
        let vertex = this.state.vertices.find(v => v.id === id);
        return {x: vertex.x * this.state.canvasWidth, y: vertex.y * this.state.canvasHeight };
      };
      c.beginPath();
      let initialCoords = getCoordsFromVertexId(this.state.path[0]);
      c.moveTo(initialCoords.x, initialCoords.y);
      for(let i = 1; i < this.state.path.length; i++) {
        let {x, y} = getCoordsFromVertexId(this.state.path[i]);
        c.lineTo(x, y);
        c.stroke();
      }
      if(this.state.path.length === this.NUM_VERTICES) {
        c.lineTo(initialCoords.x, initialCoords.y);
        c.stroke();
      }
    }

    // draw vertices
    for(let v of this.state.vertices) {
      if(v.selected) {
        c.fillStyle = this.VERTEX_SELECTED_COLOR;
      } else if(v.hover) {
        c.fillStyle = this.VERTEX_HOVER_COLOR;
      } else {
        c.fillStyle = this.VERTEX_COLOR;
      }
      c.beginPath();
      c.arc(v.x * width, v.y * height, this.RADIUS, 0, Math.PI * 2, true);
      c.fill();
      c.stroke();
      c.font = '20px serif';
      // c.strokeText(v.id, v.x * width - 5, v.y * height + 7);
      c.strokeText(v.id, v.x * width - 5, v.y * height - 13);
    }
  }

  handleMouseMove(e) {
    let mouseCoords = this.getMouseCoords(e);
    let vertices = this.state.vertices.map(v => {
      v.hover = this.getDistance(mouseCoords, { x: v.x * this.state.canvasWidth, y: v.y * this.state.canvasHeight }) < this.RADIUS;
      return v;
    });
    this.setState({ vertices });
  }

  handleMouseClick(e) {
    let { x, y } = this.getMouseCoords(e);
    let selectedId = -1;
    let vertices = this.state.vertices.map(v => {
      if(selectedId === -1 && v.selected === false && (Math.sqrt(Math.pow(x - v.x * this.state.canvasWidth, 2) + Math.pow(y - v.y * this.state.canvasHeight, 2)) < this.RADIUS)) {
        v.selected = true;
        selectedId = v.id;
      }
      return v;
    });
    if(selectedId !== -1) {
      let path = this.state.path.concat(selectedId);
      this.setState({ vertices, path }, () => {
        if(path.length === this.NUM_VERTICES) {
          this.shortestPath();
        }
      });
    }
  }

  getMouseCoords(e) {
    let bounds = e.target.getBoundingClientRect();
    let x = e.clientX - bounds.left;
    let y = e.clientY - bounds.top;
    return { x, y };
  }

  shortestPathOverall() {
    this.shortestPath(true);
  }

  shortestPath(startOver = false) {
    let path;
    if(startOver === true) {
      path = [0];
    } else {
      path = JSON.parse(JSON.stringify(this.state.path));
      if(path.length === 0) {
        path.push(0);
      }
    }
    let remainingVertices = this.state.vertices.filter(v => path.find(id => id === v.id) === undefined);
    // while(remainingVertices.length > 0) {
    //   let lastVertex = getVertexFromVertexId(path[path.length - 1]);
    //   let currentClosestVertex = remainingVertices[0];
    //   let currentClosestVertexDistance = this.getDistance(lastVertex, currentClosestVertex);
    //   for(let i = 1; i < remainingVertices.length; i++) {
    //     let currentVertex = remainingVertices[i];
    //     let currentVertexDistance = this.getDistance(lastVertex, currentVertex);
    //     if(currentVertexDistance < currentClosestVertexDistance) {
    //       currentClosestVertex = currentVertex;
    //       currentClosestVertexDistance = currentVertexDistance;
    //     }
    //   }
    //   path.push(currentClosestVertex.id);
    //   remainingVertices.splice(remainingVertices.findIndex(v => v.id === currentClosestVertex.id), 1);
    // }
    // console.log(path);
    let shortestPath = this.shortestPathRecursive(path, remainingVertices, remainingVertices.length > 0 ? this.calculatePathLength(path) : this.calculateLoopPathLength(path));
    console.log(shortestPath);
    console.log('shortest path length: ' + this.calculateLoopPathLength(shortestPath.path));
    console.log('selected path length: ' + this.calculateLoopPathLength(this.state.path));
  }

  shortestPathRecursive(path, remainingVertices, length, initial = true) {
    if(remainingVertices.length === 1) {
      let distanceToLastVertex = this.getDistance(this.state.vertices.find(v => v.id === path[path.length - 1]), remainingVertices[0]);
      let distanceToOrigin = this.getDistance(remainingVertices[0], this.state.vertices.find(v => v.id === path[0]));
      return {
        length: distanceToLastVertex + distanceToOrigin + (initial ? length : 0),
        path: path.concat(remainingVertices[0].id)
      };
    } else if(remainingVertices.length < 1) {
      return { length, path };
    }
    let lastVertex = this.state.vertices.find(v => v.id === path[path.length - 1]);
    let currentBestOption = remainingVertices[0];
    let newPath = path.concat(currentBestOption.id);
    let newRemainingVertices = remainingVertices.filter(v => v.id !== currentBestOption.id);
    let currentBestOptionDistance = this.getDistance(lastVertex, currentBestOption);
    let currentBestOptionShorestPath = this.shortestPathRecursive(newPath, newRemainingVertices, length + currentBestOptionDistance, false);
    for(let i = 1; i < remainingVertices.length; i++) {
      let currentOption = remainingVertices[i];
      newPath = path.concat(currentOption.id);
      newRemainingVertices = remainingVertices.filter(v => v.id !== currentOption.id);
      let currentOptionDistance = this.getDistance(lastVertex, currentOption);
      let currentOptionShortestPath = this.shortestPathRecursive(newPath, newRemainingVertices, length + currentOptionDistance, false);
      if(currentOptionShortestPath.length + currentOptionDistance < currentBestOptionShorestPath.length + currentBestOptionDistance) {
        currentBestOption = currentOption;
        currentBestOptionShorestPath = currentOptionShortestPath;
        currentBestOptionDistance = currentOptionDistance;
      }
    }
    return {
      length: currentBestOptionShorestPath.length + currentBestOptionDistance + (initial ? length : 0),
      path: currentBestOptionShorestPath.path
    };
  }

  calculatePathLength(path) {
    let length = 0;
    let findVertexById = id => v => v.id === id;
    let lastVertex = this.state.vertices.find(findVertexById(0));
    for(let i = 1; i < path.length; i++) {
      let vertex = this.state.vertices.find(findVertexById(path[i]));
      length += this.getDistance(lastVertex, vertex);
      lastVertex = vertex;
    }
    return length;
  }

  calculateLoopPathLength(path) {
    let firstVertex = this.state.vertices.find(v => v.id === path[0]);
    let lastVertex = this.state.vertices.find(v => v.id === path[path.length - 1]);
    if(path.length >= 2) {
      return this.calculatePathLength(path) + this.getDistance(firstVertex, lastVertex);
    } else {
      return 0;
    }
  }

  reset() {
    this.setState({ vertices: this.generateNewVertices(this.NUM_VERTICES), path: [] });
  }

  componentWillMount() {
    this.reset();
  }

  componentDidMount() {
    this.renderCanvas();
    window.addEventListener('resize', this.renderCanvas);
  }

  componentDidUpdate() {
    this.renderCanvas();
  }

  render() {
    return (
      <div className="app">
        <div className="app-header">
          <h2>Traveling Salesman Problem Visualization</h2>
        </div>
        <div className="container">
          <p className="app-intro">
            Click on vertices and try to guess the shortest path connecting all 10!
          </p>
          <canvas id="canvas" ref={ref => this.canvas = ref} onMouseMove={this.handleMouseMove} onClick={this.handleMouseClick} />
          <div className="button-container">
            <button onClick={this.reset}>Reset</button>
            <button onClick={this.shortestPath}>Shortest Path From Here</button>
            <button onClick={this.shortestPathOverall}>Shortest Path Overall</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
