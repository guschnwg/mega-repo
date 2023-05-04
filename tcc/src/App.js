import GAME from "./game.json";

import 'react-tooltip/dist/react-tooltip.css'

import confetti from 'canvas-confetti';

import React, { useCallback, useRef, useState } from "react";
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

function EndLevel({ country, guesses, tips, showRightAttempt, showTimeExceeded, showGuessExceeded, onNext }) {
  const [viewDetails, setViewDetails] = useState(false)

  const rightGuess = guesses.find(guess => guess.isRight);

  return (
    <Modal isOpen>
      <div className='right-attempt'>
        <div className="info">
          {!viewDetails ? (
            <div className="general">
              <div className="flag">{country.flag}</div>

              {showRightAttempt ? (
                <h2> Parabéns! {country.name}!!! Continue assim!</h2>
              ) : (
                <h2>Que pena! Era {country.name}... Vamos tentar outro país?</h2>
              )}

              {showTimeExceeded && <p>O jogo acabou porque o tempo para este nível acabou.</p>}

              {showGuessExceeded && <p>O nível acabou porque você usou todas as suas chances.</p>}

              {rightGuess ? (
                <div>
                  <h3>Você acertou em {guesses.length} tentativas!</h3>

                  <p>Você levou {rightGuess.timeElapsed} segundos!</p>
                  <p>Você usou {tips.length} dicas!</p>
                </div>
              ) : (
                <div>

                </div>
              )}

              <button onClick={() => setViewDetails(true)}>Ver detalhes</button>
            </div>
          ) : (
            <div className="details">
              <h4>Fatos curiosos:</h4>

              <ul>
                {country.facts.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>

                <h4>Curiosidades:</h4>

                <ul>
                  {country.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>

                <button onClick={onNext}>Próximo nível</button>
            </div>
          )}
        </div>
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

  const timeElapsed = useRef();

  //

  const country = GAME.countries[level];

  const timeRunning = !showTimeExceeded && !showRightAttempt && !showGuessExceeded && playing && !showGuessAttempt && !showTips;

  const handleGuess = guess => {
    const isRight = guess.country.id === country.country;
    setGuesses(prev => [...prev, { data: guess, timeElapsed: timeElapsed.current, isRight }]);

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
    timeElapsed.current = 0;

    // Hide modals
    setShowGuessAttempt(false);
    setShowRightAttempt(false);
    setShowTimeExceeded(false);
    setShowGuessExceeded(false);
  };

  const onTimerChange = useCallback(time => timeElapsed.current = time, []);

  if (!country) {
    return <EndGame game={game} />;
  }

  return (
    <>
      <div className='app'>
        <div className='header'>
          <Timer
            key={level}
            start={time}
            active={timeRunning}
            countdown
            limit={timeLimit}
            onChange={onTimerChange}
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
            onlyOnce
            onGuess={handleGuess}
            onHide={() => setShowGuessAttempt(false)}
          />
        )}

        {(showRightAttempt || showTimeExceeded || showGuessExceeded) && (
          <EndLevel
            guesses={guesses}
            tips={tipsViewed}
            showRightAttempt={showRightAttempt}
            showTimeExceeded={showTimeExceeded}
            showGuessExceeded={showGuessExceeded}
            country={country}
            onNext={handleNext}
          />
        )}
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
