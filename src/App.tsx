import React from 'react';
import logo from './logo.svg';
import './App.css';
import ImageClassifier from './ImageClassifier';
import ModelDetect from './ModelDetect';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
       <ModelDetect />
      </header>
    </div>
  );
}

export default App;
