"use client";

import { useState } from 'react';
import { CONTINENTS } from '../../components/World';

export default function Index() {
  const [config, setConfig] = useState({
    timeLimit: 60,
    guessLimit: 5,
    tipsLimit: 4,
    skipTutorial: false,
    continents: [...CONTINENTS],
  });

  return (
    <div className='app config'>
      <div>
        <label>Limite de tempo</label>
        <input value={config.timeLimit} onChange={event => setConfig(prev => ({...prev, timeLimit: event.target.value}))} />
      </div>

      <div>
        <label>Limite de palpites</label>
        <input value={config.guessLimit} onChange={event => setConfig(prev => ({...prev, guessLimit: event.target.value}))} />
      </div>

      <div>
        <label>Limite de dicas</label>
        <input value={config.tipsLimit} onChange={event => setConfig(prev => ({...prev, tipsLimit: event.target.value}))} />
      </div>

      <div>
        <label>Pular tutorial</label>
        <input type="checkbox" checked={config.skipTutorial} onChange={event => setConfig(prev => ({...prev, skipTutorial: event.target.checked}))} />
      </div>

      <div className='continents'>
        <label>Continentes</label>
        <div>
          <ol>
            {CONTINENTS.map(continent => (
              <li key={continent}>
                <input
                  type="checkbox"
                  checked={config.continents.includes(continent)}
                  onChange={event => {
                    setConfig(prev => {
                      let next = prev.continents;
                      if (event.target.checked) {
                        next.push(continent);
                      } else {
                        next = next.filter(v => v !== continent);
                      }
      
                      return { ...prev, continents: next };
                    })
                  }}
                />
                {continent}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <button
        className='big'
        onClick={() => {
          const params = new URLSearchParams(config);
          window.location.href = '/?' + params.toString();
        }}
      >JOGAR</button>
    </div>
  );
}
