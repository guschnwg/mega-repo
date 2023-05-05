'use client';

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


const CONTINENTS = ["África", "América do Sul", "Ásia", "Oceania", "América do Norte", "Europa"];
const VALID_COUNTRIES = CONTINENTS.map(continent => {
  const possible = GAME.countries.filter(country => country.continent === continent);
  return possible[Math.floor(Math.random() * possible.length)];
}).sort(() => 0.5 - Math.random())


function points(level) {
  const totalOfPoints = 1000;

  // If there are no right guesses, then we already lose 100 points.
  const noRightGuessLost = level.guesses.find(guess => guess.isRight) ? 0 : 50;

  // In 5 guesses, you can lower your score by 250 points max
  // The max is 50 points per level, so 50 * 5 guesses
  const guessLost = level.guesses.filter(guess => !guess.isRight).length * 50;

  // In 4 tips, you can lower your score by 300 points
  // The max is 4 tips per guess, so 4 tips * 15 points * 5 guesses
  const tipsLost = level.guesses.reduce((agg, crr) => agg + crr.tipsViewed.length * 15, 0);

  // In 5 guesses, you can lower your score by 300 points
  // The max is 60 points per level, so 60 * 5
  const timeLost = level.guesses.reduce((agg, crr) => agg + parseInt(crr.timeElapsed), 0);

  console.log(level.guesses, noRightGuessLost, guessLost, tipsLost, timeLost);

  // The minimum amount of points is 50 points, the max is 1000, but that is very difficult
  return totalOfPoints - noRightGuessLost - guessLost - tipsLost - timeLost;
}


function EndGame({ name, game, onFinish }) {
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [tutorial, ...realGame] = game;

  return (
    <div className="end-game">
      <h1>Acabouuuuu :D</h1>

      <p>Valeu por jogar nosso joguinho, {name}!</p>

      {onFinish && !submitted && (
        <>
          <p>O que achou?</p>

          <textarea type="text" value={feedback} onChange={event => setFeedback(event.target.value)} />

          <button
            onClick={() => {
              onFinish(name, game, feedback);
              setSubmitted(true);
            }}
          >Finalizar</button>
        </>
      )}

      {(!onFinish || submitted) && (
        <div className="summary">
          <iframe
            src="https://giphy.com/embed/kFNghExveIAk7fp6GX"
            width="180px"
            height="180px"
            style={{ pointerEvents: 'none', border: 'none', transform: 'scale(1.8)' }}
            class="giphy-embed"
            allowFullScreen
            title="Minion dançando"
          />

          < div >
            No Tutorial, que o país era {tutorial.country.name}, que fica na {tutorial.country.continent}, a pontuação foi de:
            {' '}
            <span className="points"><span className="number-of-points">{points(tutorial)}</span> pontos!</span>
          </div>

          {
            realGame.map((real, i) => (
              <div>
                No nível {i + 1}, que era {real.country.name}, que fica na {real.country.continent}, você fez um total de:
                {' '}
                <span className="points"><span className="number-of-points">{points(real)}</span> pontos!</span>
              </div>
            ))
          }
        </div >
      )
      }
    </div>
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

function Game({ name, country, level, levelCount, playing, canLose, timeLimit, guessLimit, tipsLimit, onChangeLevel, onFinish }) {

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

  const timeRunning = !showTimeExceeded && !showRightAttempt && !showGuessExceeded && playing && !showGuessAttempt && !showTips;

  const handleGuess = guess => {
    const isRight = guess.country.id === country.country;
    setGuesses(prev => [...prev, { data: guess, tipsViewed, timeElapsed: timeElapsed.current, isRight }]);

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
    setGame(prev => [...prev, { start: time, country, guesses }]);
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
    return <EndGame name={name} game={game} onFinish={onFinish} />;
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

          <div className="level-info">Nível {level + 1}/{levelCount}</div>

          {showTips && (
            <Tips
              tips={country.tips}
              viewed={tipsViewed}
              tipsLimit={tipsLimit}
              onView={handleTipView}
              onHide={() => setShowTips(false)}
            />
          )}

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

function App({ onFinish }) {
  const [level, setLevel] = useState(0);
  const [isTutorial, setIsTutorial] = useState(level === 0);
  const [name, setName] = useState(null);

  console.log("Will play", VALID_COUNTRIES);

  const country = level === 0 ? GAME.tutorial : VALID_COUNTRIES[level - 1];

  return (
    <>
      <Game
        name={name}
        country={country}
        level={level}
        levelCount={VALID_COUNTRIES.length + 1}
        playing={!isTutorial}
        canLose={level !== 0}
        timeLimit={60}
        guessLimit={5}
        tipsLimit={4}
        onChangeLevel={setLevel}
        onFinish={onFinish}
      />

      {isTutorial && (
        <Tutorial
          timeLimit={60}
          guessLimit={5}
          tipsLimit={4}
          onClose={() => setIsTutorial(false)}
          onName={setName}
        />)}
    </>
  )
}

export default App;

// Object.assign(['one', 'two', 'three'], {one: 1, two: 2, three: 3 })
