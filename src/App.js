import React from 'react';
import './App.css';
import ElasticFace from './components/ElasticFace';
import Instructions from './components/Instructions';

function App() {
  return (
    <div className="App">
      <div className="app-header">
        <h1>The Elastic Face</h1>
        <p>Click and drag any part of the face to stretch it!</p>
      </div>
      <ElasticFace />
      <Instructions />
    </div>
  );
}

export default App;
