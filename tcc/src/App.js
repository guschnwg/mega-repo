import GAME from "./game.json";

import 'react-tooltip/dist/react-tooltip.css'

import confetti from 'canvas-confetti';

import React, { useState } from "react";
import Modal from 'react-modal';


import { Guess } from "./Guess";
import { StreetView } from "./StreetView";
import { Timer } from "./Timer";
import { Tips } from "./Tips";
import { Tutorial } from "./Tutorial";

Modal.setAppElement('#modal');


function EndGame({ game }) {
  return (
    <pre>
      {JSON.stringify(game, null, 2)}
    </pre>
  );
}

function EndLevel({ country, showRightAttempt, showTimeExceeded, showGuessExceeded, onNext }) {



  return (
    <Modal isOpen={showRightAttempt || showTimeExceeded || showGuessExceeded}>
      <div className='right-attempt'>
        <div className="info">
          {showRightAttempt && (
            <div className="country-name">
              <h2>Parabéns! {country.name}!!! Continue assim!</h2>
              <div className="flag">{country.flag}</div>
            </div>
          )}

          {(showTimeExceeded || showGuessExceeded) && (
            <>

              <div className="country-name">
                <h2>Que pena! Era {country.name}</h2>
                <div className="flag">{country.flag}</div>
              </div>

              <div>
                {showTimeExceeded && (
                  <p>
                    O jogo acabou porque o tempo para este nível acabou.
                    Não fique triste, é normal não acertar sempre, ainda mais com o tempo limitado!
                  </p>
                )}
                {showGuessExceeded && (
                  <p>
                    O nível acabou porque você usou todas as suas chances.
                    Isso significa que você já tentou adivinhar o país várias vezes, mas não acertou.
                    Não fique triste, é normal não acertar sempre de primeira!
                  </p>
                )}
              </div>
            </>
          )}

          <h4>Curiosidades:</h4>

          <ul>
            {country.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        <button onClick={onNext}>Próximo nível</button>
      </div>
    </Modal>
  )
}

function Game({ level, playing, canLose, timeLimit, guessLimit, tipsLimit, onChangeLevel }) {

  const [time, setTime] = useState(Date.now());
  const [guesses, setGuesses] = useState([]);
  const [game, setGame] = useState([]);
  const [tipsViewed, setTipsViewed] = useState([]);

  const [showGuessAttempt, setShowGuessAttempt] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showRightAttempt, setShowRightAttempt] = useState(false);
  const [showTimeExceeded, setShowTimeExceeded] = useState(false);
  const [showGuessExceeded, setShowGuessExceeded] = useState(false);

  //

  const country = GAME.countries[level];

  const timeRunning = !showTimeExceeded && !showRightAttempt && !showGuessExceeded && playing && !showGuessAttempt && !showTips;

  const handleGuess = guess => {
    const isRight = guess.country.id === country.country;
    setGuesses(prev => [...prev, { data: guess, isRight }]);

    if (isRight) {
      confetti({ zIndex: Number.MAX_SAFE_INTEGER, particleCount: 200, spread: 100, gravity: 2 });
      setShowGuessAttempt(false);
      setShowRightAttempt(true);
    } else if (canLose && guesses.length + 1 >= guessLimit) {
      setShowGuessAttempt(false);
      setShowGuessExceeded(true);
    }
  }

  const handleTipView = tip => {
    if (tipsViewed.length >= tipsLimit) {
      return;
    }
    setTipsViewed(prev => [...prev, tip]);

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const toSpeak = new SpeechSynthesisUtterance(tip);
    const possibleVoices = window.speechSynthesis.getVoices().filter(voice => voice.lang === 'pt-BR');
    toSpeak.rate = .9;
    toSpeak.voice = possibleVoices[Math.floor(Math.random() * possibleVoices.length)];
    window.speechSynthesis.speak(toSpeak);
  }

  const handleNext = () => {
    onChangeLevel(level + 1);
    setGame(prev => [...prev, { start: time, country, guesses, tipsViewed }]);
    setGuesses([]);
    setTipsViewed([]);
    setTime(Date.now());

    // Hide modals
    setShowGuessAttempt(false);
    setShowRightAttempt(false);
    setShowTimeExceeded(false);
    setShowGuessExceeded(false);
  };

  if (!country) {
    return <EndGame game={game} />;
  }

  return (
    <>
      <div className='app'>
        <div className='header'>
          <Timer
            start={time}
            active={timeRunning}
            countdown
            limit={timeLimit}
            onEnd={() => {
              if (canLose) {
                setShowTimeExceeded(true);
                setShowGuessAttempt(false);
              }
            }}
          />

          <Tips
            show={showTips}
            tips={country.tips}
            viewed={tipsViewed}
            tipsLimit={tipsLimit}
            onView={handleTipView}
            onHide={() => setShowTips(false)}
          />

          <button
            onClick={() => setShowTips(true)}
            id="tips-button"
          >
            Dicas {tipsViewed.length}/{tipsLimit}
          </button>

          <button
            className="guess-button"
            id="guess-button"
            onClick={() => setShowGuessAttempt(true)}
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

        <EndLevel
          showRightAttempt={showRightAttempt}
          showTimeExceeded={showTimeExceeded}
          showGuessExceeded={showGuessExceeded}
          country={country}
          onNext={handleNext}
        />
      </div>
    </>
  );
}

function App() {
  const [level, setLevel] = useState(0);
  const [isTutorial, setIsTutorial] = useState(level === 0);

  return (
    <>
      <Game
        level={level}
        playing={!isTutorial}
        canLose={level !== 0}
        timeLimit={60}
        guessLimit={5}
        tipsLimit={4}
        onChangeLevel={setLevel}
      />

      {isTutorial && (
        <Tutorial
          timeLimit={60}
          guessLimit={5}
          tipsLimit={4}
          onClose={() => setIsTutorial(false)}
        />)}
    </>
  )
}

export default App;

// Object.assign(['one', 'two', 'three'], {one: 1, two: 2, three: 3 })
