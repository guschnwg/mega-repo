import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App, { getConfig, getGame } from './components/App';
// import Debug from './components/Debug';

const root = ReactDOM.createRoot(document.getElementById('root'));
const params = Object.fromEntries(new URLSearchParams(window.location.search));
root.render(
  <React.StrictMode>
    <App
      {...getConfig(params)}
      countries={getGame(params.continents)}
    />
    {/* <Debug /> */}
  </React.StrictMode>
);
