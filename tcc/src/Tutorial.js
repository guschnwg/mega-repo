import React, { useState } from "react";

const TheGame = () => (
  <div>
    <h1>O Jogo</h1>

    <p>Neste jogo aprenderemos um pouco de História e Geografia</p>

    <p>Também é falado um pouco sobre a cultura de cada lugar</p>

    <p>...</p>
  </div>
);

const Objective = () => (
  <div>
    <h1>O Objetivo</h1>

    <p>...</p>
  </div>
);


const Time = ({ limit }) => (
  <div>
    <h1>O Cronômetro</h1>

    <p>...</p>
  </div>
);

const Navigation = () => (
  <div>
    <h1>Como se mover</h1>

    <p>...</p>
  </div>
);

const Tips = ({ limit }) => (
  <div>
    <h1>Dicas</h1>

    <p>...</p>
  </div>
);

const Guess = ({ limit }) => (
  <div>
    <h1>Palpite</h1>

    <p>...</p>
  </div>
);

export function Tutorial({ timeLimit, tipsLimit, guessLimit, onClose }) {
  const [step, setStep] = useState('game');

  const steps = {
    game: { label: 'O jogo', comp: <TheGame /> },
    objective: { label: 'Objetivo', comp: <Objective /> },
    time: { label: 'Tempo', comp: <Time limit={timeLimit} /> },
    navigation: { label: 'Navegação', comp: <Navigation /> },
    tips: { label: 'Dicas ', comp: <Tips limit={tipsLimit} /> },
    guess: { label: 'Palpite', comp: <Guess limit={guessLimit} /> },
  };

  return (
    <div className="tutorial">
      <button className="close" onClick={onClose}>
        Sair
      </button>

      {step === 'name' ? (
        <div>
          <h1>
            Olá! Qual o seu nome?
          </h1>
        </div>
      ) : (
        <>
          {steps[step]?.comp}
          <div className="controls">
            {Object.entries(steps).map(([key, data]) => (
              <button
                key={key}
                className={step === key ? 'active' : ''}
                onClick={() => setStep(key)}
              >
                {data.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
