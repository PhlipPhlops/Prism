import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { brain_uri } from './globals';

function App() {

  const [brainText, setBrainText] = useState(`Edit!! <code>src/App.js</code> and save to reload.`)

  useEffect(() => {
    const fetchBrainText = async () => {
      try {
        let resp = await fetch(`${brain_uri}/`)
        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }
        setBrainText(await resp.text())
      } catch (e) {
        console.error(`brain_uri: ${brain_uri}`)
        console.error(e)
      }
    }
    fetchBrainText()
  }, [])

  console.log(`brainText: ${brainText}`)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {brainText}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
