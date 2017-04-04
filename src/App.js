import React, { Component } from 'react';
// import graph from './graph.png';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vertices: []
    };

    this.NUM_VERTICES = 10;
    this.RADIUS = 10;

    this.generateNewVertices = this.generateNewVertices.bind(this);
    this.renderCanvas = this.renderCanvas.bind(this);
    this.reset = this.reset.bind(this);
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
      for(let j = 0; j < 1000; j++) { // TODO don't give up after 1000 attempts
        newPoint = generateNewPoint();
        let invalid = false;
        for(let v of vertices) {
          // console.log(Math.sqrt(Math.pow(newPoint.x - v.x, 2) + Math.pow(newPoint.y - v.y, 2)));
          if(Math.sqrt(Math.pow(newPoint.x - v.x, 2) + Math.pow(newPoint.y - v.y, 2)) < .2) {
            console.log('small distance');
            invalid = true;
            break;
          }
        }
        if(!invalid) {
          break;
        }
      }
      vertices.push(newPoint);
    }
    return vertices;
  }

  renderCanvas() {
    let canvas = document.getElementById('canvas');
    let width = canvas.parentElement.clientWidth;
    console.log(width);
    let height = width / 2;
    canvas.width = width;
    canvas.height = height;

    let c = this.canvas.getContext('2d');
    c.fillStyle = '#0f0';
    c.strokeStyle = "#000";
    for(let v of this.state.vertices) {
      c.beginPath();
      c.arc(v.x * width, v.y * height, this.RADIUS, 0, Math.PI * 2, true);
      c.fill();
      c.stroke();
    }
  }

  reset() {
    this.setState({ vertices: this.generateNewVertices(this.NUM_VERTICES) });
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
        <div className="container" onResize={() => alert('hi')}>
          <p className="app-intro">
            Click on vertices and try to guess the shortest path connecting all 10!
          </p>
          <canvas id="canvas" ref={ref => this.canvas = ref}></canvas>
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
