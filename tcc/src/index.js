import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
const params = Object.fromEntries(new URLSearchParams(window.location.search));
root.render(
  <React.StrictMode>
    <App
      {...getConfig(params)}
      countries={getGame(params.continents)}
    />
  </React.StrictMode>
);
