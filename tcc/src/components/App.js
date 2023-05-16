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

const AVAILABLE_CONTINENTS = ["África", "América do Sul", "Ásia", "Oceania", "América do Norte", "Europa"];

const params = new URLSearchParams(window.location.search);
const CHOSEN_CONTINENTS = params.getAll('continents').filter(c => AVAILABLE_CONTINENTS.includes(c));
const TIME_LIMIT = params.get('time_limit') || 60;
const GUESS_LIMIT = params.get('guess_limit') || 5;
const TIPS_LIMIT = params.get('tips_limit') || 5;
const SKIP_TUTORIAL = params.has('skip_tutorial') || false;

const CONTINENTS = CHOSEN_CONTINENTS.length ? CHOSEN_CONTINENTS : AVAILABLE_CONTINENTS;
const VALID_COUNTRIES = CONTINENTS.map(continent => {
  const possible = GAME.countries.filter(country => country.continent === continent);
  return possible[random(0, possible.length - 1)];
}).sort(() => 0.5 - Math.random());

function random(min = 200, max = 450) {
  return (Math.round(Math.pow(10, 14) * Math.random() * Math.random()) % (max - min + 1)) + min;
}

function convertValue(fromScale, toScale, value) {
  return toScale.min - ((fromScale.min - value) / fromScale.max) * toScale.max;
}

function pointsCalculator(guesses, timeLimit, guessLimit, tipsLimit) {
  const totalOfPoints = 1_000_000;

  // If there are no right guesses, then we already lose 1000 points.
  const noRightGuessLost = guesses.find(guess => guess.isRight) ? 0 : 1000 * random();

  // In 5 guesses, you can lower your score by 2500 points max
  // The max is 50 points per level, so 500 * 5 guesses
  const guessLost = convertValue({ min: 0, max: 5 }, { min: 0, max: guessLimit }, guesses.filter(guess => !guess.isRight).length) * 500 * random();

  // In 4 tips, you can lower your score by 3000 points
  // The max is 4 tips per guess, so 4 tips * 150 points * 5 guesses
  const tipsLost = guesses.reduce((agg, crr) => agg + convertValue({ min: 0, max: 4 }, { min: 0, max: tipsLimit }, parseInt(crr.tipsViewed.length)) * 150 * random(), 0);

  // In 5 guesses, you can lower your score by 300 points
  // The max is 60 points per level, so 60 * 5
  const timeLost = guesses.reduce((agg, crr) => agg + (convertValue({ min: 0, max: 60 }, { min: 0, max: timeLimit }, parseInt(crr.timeElapsed))) * random(), 0);

  // The minimum amount of points is ?? points, the max is 999_999, but that is very difficult
  return totalOfPoints - parseInt(noRightGuessLost) - parseInt(guessLost) - parseInt(tipsLost) - parseInt(timeLost) - random(1, 9);
}


function Points({ points }) {
  return (
    <p className="points">
      Você fez{' '}
      <span className="number-of-points">
        {new Intl.NumberFormat('pt-BR').format(points)}
      </span>
      {' '}pontos!
    </p>
  )
}


function EndGame({ name, game, onFinish }) {
  const [submitted, setSubmitted] = useState(false);
  const [feedback] = useState('');

  const tutorial = game.find(g => g.isTutorial);
  const realGame = game.filter(g => !g.isTutorial);

  return (
    <div className="end-game">
      <h1>Acabouuuuu :D</h1>

      <p>Valeu por jogar nosso joguinho, {name}!</p>

      {onFinish && !submitted && (
        <>
          {/* <p>O que achou?</p>

          <textarea type="text" value={feedback} onChange={event => setFeedback(event.target.value)} /> */}

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

          {tutorial && (
            <div>
              No Tutorial, que o país era {tutorial.country.name}, que fica na {tutorial.country.continent}, a pontuação foi de:
              {' '}
              <Points points={tutorial.points} />
            </div>
          )}

          {realGame.map((real, i) => (
            <div>
              No nível {i + 1}, que era {real.country.name}, que fica na {real.country.continent}, você fez um total de:
              {' '}
              <Points points={real.points} />
            </div>
          ))}
        </div >
      )
      }
    </div>
  );
}

function EndLevel({ country, guesses, tips, timeLimit, guessLimit, tipsLimit, showRightAttempt, showTimeExceeded, showGuessExceeded, onNext }) {
  const [viewDetails, setViewDetails] = useState(false);
  const [points] = useState(pointsCalculator(guesses, timeLimit, guessLimit, tipsLimit));

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

              <Points points={points} />

              {rightGuess && (
                <div>
                  <h3>Você acertou em {guesses.length} tentativas!</h3>

                  <p>Você levou {rightGuess.timeElapsed} segundos!</p>
                  <p>Você usou {tips.length} dicas!</p>
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

              <button onClick={() => onNext(points)}>Próximo nível</button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

function Game({ name, country, level, isTutorial, levelCount, playing, canLose, timeLimit, guessLimit, tipsLimit, onChangeLevel, onFinish }) {
  const [time, setTime] = useState(Date.now());
  const [guesses, setGuesses] = useState([]);
  const [game, setGame] = useState([]);
  const [tipsViewed, setTipsViewed] = useState([]);
  const [place, setPlace] = useState(() => random(0, country.places.length - 1));

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
    setGuesses(prev => [...prev, { data: guess, tipsViewed, timeElapsed: timeElapsed.current, isRight, place: country.places[place] }]);

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

  const handleNext = (points) => {
    onChangeLevel(level + 1);
    setGame(prev => [...prev, { start: time, country, guesses, points, isTutorial }]);
    setGuesses([]);
    setTipsViewed([]);
    setTime(Date.now());
    setPlace(random(0, country.places.length - 1));
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
          country={country.places[place]}
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
            timeLimit={timeLimit}
            guessLimit={guessLimit}
            tipsLimit={tipsLimit}
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
  const [level, setLevel] = useState(SKIP_TUTORIAL ? 1 : 0);
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
        isTutorial={isTutorial}
        canLose={level !== 0}
        timeLimit={TIME_LIMIT}
        guessLimit={GUESS_LIMIT}
        tipsLimit={TIPS_LIMIT}
        onChangeLevel={setLevel}
        onFinish={onFinish}
      />

      {isTutorial && (
        <Tutorial
          timeLimit={TIME_LIMIT}
          guessLimit={GUESS_LIMIT}
          tipsLimit={TIPS_LIMIT}
          onClose={() => setIsTutorial(false)}
          onName={setName}
        />)}
    </>
  )
}

export default App;

// Object.assign(['one', 'two', 'three'], {one: 1, two: 2, three: 3 })
