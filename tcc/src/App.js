import GAME from "./game.json";

import 'react-tooltip/dist/react-tooltip.css'

import confetti from 'canvas-confetti';

import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from 'react-modal';


import { TutorialContext, Tutorial } from "./TutorialContext";
import { Guess } from "./Guess";
import { StreetView } from "./StreetView";
import { Timer } from "./Timer";
import { Tips } from "./Tips";

Modal.setAppElement('#modal');


function EndGame({ game }) {
  return (
    <pre>
      {JSON.stringify(game, null, 2)}
    </pre>
  );
}

function RightAttempt({ country, onNext }) {
  return (
    <Modal isOpen>
      <div className='right-attempt'>
        <div className="info">
          <div className="country-name">
            <h2>{country.name}</h2>
            <div className="flag">{country.flag}</div>
          </div>

          <p>Curiosidades:</p>

          <ul>
            {country.facts.map((curiosidade, index) => (
              <li key={index}>{curiosidade}</li>
            ))}
          </ul>
        </div>

        <button onClick={onNext}>Próximo nível</button>
      </div>
    </Modal>
  )
}

function TimeExceeded({ onNext }) {
  return (
    <Modal isOpen>
      <div className="right-attempt">
        <div className="info">
          <h2>Que pena!</h2>
          <p>O jogo acabou porque você usou todas as suas chances.</p>
          <p>Isso significa que você já tentou adivinhar o país várias vezes, mas não acertou.</p>
          <p>Não fique triste, é normal não acertar sempre de primeira!</p>
          <p>Vamos jogar de novo e tentar acertar mais países da próxima vez!</p>
        </div>

        <button onClick={onNext}>Próximo nível</button>
      </div>

    </Modal>
  )
}

function GuessExceeded({ onNext }) {
  return (
    <Modal isOpen>
      FUCK
      <button onClick={onNext}>Próximo nível</button>
    </Modal>
  )
}

function Game({ level, isTutorial, timeLimit, guessLimit, tipsLimit, onChangeLevel }) {

  const [time, setTime] = useState(Date.now());
  const [guesses, setGuesses] = useState([]);
  const [game, setGame] = useState([]);
  const [tipsViewed, setTipsViewed] = useState([]);

  const [showGuessAttempt, setShowGuessAttempt] = useState(false);
  const [showRightAttempt, setShowRightAttempt] = useState(false);
  const [showTimeExceeded, setShowTimeExceeded] = useState(false);
  const [showGuessExceeded, setShowGuessExceeded] = useState(false);

  const guessRef = useRef();

  const { steps, setElement, clear, currentStep, nextStep } = useContext(TutorialContext);

  //

  const country = GAME.countries[level];

  const timeRunning = !showTimeExceeded && !showRightAttempt && !showGuessExceeded;

  const handleGuess = guess => {
    const isRight = guess.country.id === country.country;
    setGuesses(prev => [...prev, { data: guess, isRight }]);

    if (isRight) {
      confetti({ zIndex: Number.MAX_SAFE_INTEGER, particleCount: 200, spread: 100, gravity: 2 });
      setShowGuessAttempt(false);
      setShowRightAttempt(true);
    }

    if (!isTutorial && guesses.length + 1 >= guessLimit) {
      setShowGuessExceeded(true);
    }
  }

  const handleTipView = tip => {
    if (tipsViewed.length >= tipsLimit) {
      return;
    }
    setTipsViewed(prev => [...prev, tip]);
  }

  const handleNext = () => {
    onChangeLevel(level + 1);
    setGame(prev => [...prev, { start: time, country, guesses, tipsViewed }]);
    setGuesses([]);
    setTipsViewed([]);
    setTime(Date.now());
    clear();

    // Hide modals
    setShowGuessAttempt(false);
    setShowRightAttempt(false);
    setShowTimeExceeded(false);
    setShowGuessExceeded(false);
  };

  useEffect(() => {
    if (guessRef.current) {
      setElement('guess', guessRef.current);
    }

    return () => {
      setElement('guess', null);
    }
  }, [guessRef, setElement]);

  if (!country) {
    return <EndGame game={game} />;
  }

  return (
    <>
      <div className='app'>
        <div className='header'>
          <Timer
            start={time}
            run={timeRunning}
            limit={!isTutorial && timeLimit}
            onEnd={() => {
              setShowTimeExceeded(true);
              setShowGuessAttempt(false);
            }}
          />

          <Tips
            tips={country.tips}
            viewed={tipsViewed}
            canViewTip={tipsViewed.length < tipsLimit}
            onView={handleTipView}
          />

          <button
            data-disabled={!steps.tips.completed}
            ref={guessRef}
            className="guess-button"
            id="guess-button"
            onClick={() => {
              if (steps.tips.completed) {
                setShowGuessAttempt(true)
                if (currentStep === 'guess') {
                  nextStep();
                }
              }
            }}
          >
            JÁ SEI! {guesses.length}/{guessLimit}
          </button>
        </div>

        <StreetView
          key={level}
          country={country}
        />

        {showGuessAttempt && (
          <Guess
            guesses={guesses}
            guessLimit={guessLimit}
            onGuess={handleGuess}
            onHide={() => setShowGuessAttempt(false)}
          />
        )}

        {showRightAttempt && <RightAttempt country={country} onNext={handleNext} />}

        {showTimeExceeded && <TimeExceeded onNext={handleNext} />}

        {showGuessExceeded && <GuessExceeded onNext={handleNext} />}
      </div>
    </>
  );
}

function App() {
  const [level, setLevel] = useState(0);

  return (
    <Tutorial active={level === 0}>
      <Game
        level={level}
        isTutorial={level === 0}
        timeLimit={60}
        guessLimit={5}
        tipsLimit={4}
        onChangeLevel={setLevel}
      />
    </Tutorial>
  )
}

export default App;

// Object.assign(['one', 'two', 'three'], {one: 1, two: 2, three: 3 })
