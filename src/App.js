import React, { Component } from 'react';
// import graph from './graph.png';
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

    this.generateNewVertices = this.generateNewVertices.bind(this);
    this.renderCanvas = this.renderCanvas.bind(this);
    this.reset = this.reset.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
    this.getMouseCoords = this.getMouseCoords.bind(this);
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
          if(Math.sqrt(Math.pow(newPoint.x - v.x, 2) + Math.pow(newPoint.y - v.y, 2)) < .2) {
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
    }
  }

  handleMouseMove(e) {
    let { x, y } = this.getMouseCoords(e);
    let vertices = this.state.vertices.map(v => {
      v.hover = Math.sqrt(Math.pow(x - v.x * this.state.canvasWidth, 2) + Math.pow(y - v.y * this.state.canvasHeight, 2)) < this.RADIUS;
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
      this.setState({ vertices, path });
    }
  }

  getMouseCoords(e) {
    let bounds = e.target.getBoundingClientRect();
    let x = e.clientX - bounds.left;
    let y = e.clientY - bounds.top;
    return { x, y };
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
          {/*<img src={graph} className="App-logo" alt="graph" />*/}
          <h2>Traveling Salesman Problem Visualization</h2>
        </div>
        <div className="container">
          <p className="app-intro">
            Click on vertices and try to guess the shortest path connecting all 10!
          </p>
          <canvas id="canvas" ref={ref => this.canvas = ref} onMouseMove={this.handleMouseMove} onClick={this.handleMouseClick} />
          <div className="button-container">
            <button onClick={this.reset}>Reset</button>
            <button>Shortest Path</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
