'use client';

import GAME from "./game.json";

import { datadogRum } from '@datadog/browser-rum';
import 'react-tooltip/dist/react-tooltip.css'

import confetti from 'canvas-confetti';

import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal from 'react-modal';


import { Guess } from "./Guess";
import { StreetView } from "./StreetView";
import { Timer } from "./Timer";
import { Tips } from "./Tips";
import { Tutorial } from "./Tutorial";
import { Points, RawPoints, pointsCalculator, random } from "./Points";
import { Flag } from "./Flag";
import { AVAILABLE_CONTINENTS } from '../utils/config';

Modal.setAppElement('#modal');

function EndGame({ name, game, onFinish }) {
  const [submitted, setSubmitted] = useState(!onFinish);

  const tutorial = game.find(g => g.isTutorial);
  const realGame = game.filter(g => !g.isTutorial);

  const finalScore = realGame.reduce((agg, crr) => agg + crr.points, 0)

  return (
    <div className="end-game">
      <h1>Acabouuuuu :D</h1>

      <p>Valeu por jogar nosso joguinho, {name}!</p>

      {!submitted ? (
        <div className="drums">
          <button
            onClick={() => {
              onFinish(game, finalScore);
              setSubmitted(true);
            }}
          >VER PONTUAÇÃO</button>

          <audio controls src="https://www.myinstants.com/media/sounds/y2mate_YpWYqZD.mp3" autoPlay />
        </div>
      ) : (
        <>
          <Points points={finalScore} />

          <div className="summary">
            <iframe
              src="https://giphy.com/embed/kFNghExveIAk7fp6GX"
              width="180px"
              height="180px"
              style={{ pointerEvents: 'none', border: 'none', transform: 'scale(1.8)' }}
              className="giphy-embed"
              allowFullScreen
              title="Minion dançando"
            />

            {tutorial && (
              <div>
                Tutorial: {tutorial.country.name} <Flag country={tutorial.country.country} /> na {tutorial.country.continent}:{' '}
                <RawPoints points={tutorial.points} /> pontos!
              </div>
            )}

            {realGame.map((real, i) => (
              <div key={i}>
                Nível {i + 1}: {real.country.name} <Flag country={real.country.country} /> na {real.country.continent}:{' '}
                <RawPoints points={real.points} /> pontos!
              </div>
            ))}
          </div>
        </>
      )}
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
              <Flag country={country.country} />

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

              <button className="big" onClick={() => setViewDetails(true)}>
                CURIOSIDADES
              </button>
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

function getPreferredVoice() {
  const possibleVoices = window.speechSynthesis.getVoices().filter(voice => voice.lang === 'pt-BR');
  const googleVoice = possibleVoices.find(voice => voice.name.includes('Google'));
  if (googleVoice) {
    return googleVoice;
  }
  const premiumVoice = possibleVoices.find(voice => voice.voiceURI.includes('premium'));
  if (premiumVoice) {
    return premiumVoice
  }
  const enhancedVoice = possibleVoices.find(voice => voice.voiceURI.toLowerCase().includes('enhanced') || voice.voiceURI.toLowerCase().includes('aprimorada'));
  if (enhancedVoice) {
    return enhancedVoice;
  }
  const compactVoice = possibleVoices.find(voice => voice.voiceURI.toLowerCase().includes('compact'));
  if (compactVoice) {
    return compactVoice;
  }
  // Fallback to the first one from the language that we want
  return possibleVoices[0];
}

function Game({ name, country, level, isTutorial, levelCount, playing, timeLimit, guessLimit, tipsLimit, onNext, onFinish, onRequestTutorial }) {
  const [time, setTime] = useState(Date.now());
  const [guesses, setGuesses] = useState([]);
  const [game, setGame] = useState([]);
  const [tipsViewed, setTipsViewed] = useState([]);
  const [place, setPlace] = useState(random(0, country ? country.places.length - 1 : 0));

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
    } else if (!isTutorial && guesses.length + 1 >= guessLimit) {
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
    toSpeak.voice = getPreferredVoice();
    window.speechSynthesis.speak(toSpeak);
  }

  const handleNext = (points) => {
    setGame(prev => [...prev, { start: time, country: { country: country.country, name: country.name, continent: country.continent }, guesses, points, isTutorial }]);
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

    onNext();
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
            key={country.country}
            start={time}
            active={timeRunning}
            countdown
            limit={timeLimit}
            onChange={onTimerChange}
            onEnd={() => {
              if (!isTutorial) {
                setShowTimeExceeded(true);
                setShowGuessAttempt(false);
              }
            }}
          />

          {isTutorial ? (
            <div className="level-info">
              Tutorial
            </div>
          ) : (
            <div className="level-info">
              Nível {level + 1}/{levelCount}
            </div>
          )}

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
          key={country.country}
          country={country.places[place]}
        />

        <div className="footer">
          <div>
            <button onClick={onRequestTutorial}>?</button>
          </div>

          <div>
            {country.places.map((p, i) => (
              <button
                key={p.name}
                className={i === place ? 'active' : ''}
                onClick={() => setPlace(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div />
        </div>

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

export function getGame(continents) {
  let validatedContinents = continents || [];
  validatedContinents = Array.isArray(continents) ? continents : [continents];

  const chosenContinents = validatedContinents.filter(c => AVAILABLE_CONTINENTS.includes(c));
  const validContinents = chosenContinents.length ? chosenContinents : AVAILABLE_CONTINENTS;

  console.log("Selected continents", chosenContinents);

  const validCountries = validContinents.map(continent => {
    const possible = GAME.countries.filter(country => country.continent === continent);
    console.log("Choosing from", possible, "for", continent);
    return possible[random(0, possible.length - 1)];
  }).sort(() => 0.5 - Math.random());

  console.log("Will play", validCountries);

  return validCountries;
}

function initRUM() {
  if (datadogRum.getInternalContext()) {
    return;
  }

  datadogRum.init({
    applicationId: 'cf748bb2-2fc6-44de-9d27-6d4a023fc374',
    clientToken: 'pub2e0179eacedc9a07d642961cb1bef15d',
    site: 'us5.datadoghq.com',
    service: 'country-guesser-tcc',
    env: 'dev',
    // Specify a version number to identify the deployed version of your application in Datadog 
    // version: '1.0.0',
    sessionSampleRate: 100,
    premiumSampleRate: 100,
    trackUserInteractions: true,
    defaultPrivacyLevel: 'mask-user-input'
  });

  datadogRum.startSessionReplayRecording();
}

function App({ continents, countries, timeLimit, guessLimit, tipsLimit, skipTutorial, onFinish }) {
  const [level, setLevel] = useState(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(skipTutorial);
  const [tutorialOpen, setTutorialOpen] = useState(!skipTutorial);
  const [name, setName] = useState('');

  const country = !tutorialCompleted ? GAME.tutorial : countries[level];

  useEffect(() => {
    initRUM();
    // Prepare
    window.speechSynthesis.getVoices();
  }, []);

  console.log("Game config", { countries, timeLimit, guessLimit, tipsLimit, skipTutorial });

  return (
    <>
      <Game
        name={name}
        country={country}
        level={level}
        levelCount={countries.length}
        playing={!tutorialOpen && name}
        isTutorial={!tutorialCompleted}
        timeLimit={timeLimit}
        guessLimit={guessLimit}
        tipsLimit={tipsLimit}
        onNext={() => {
          setTutorialCompleted(true);
          if (tutorialCompleted) {
            setLevel(prev => prev + 1);
          }
        }}
        onFinish={(levels, score) => {
          const data = {
            tutorial: levels.find(l => l.isTutorial),
            levels: levels.filter(l => !l.isTutorial),
            timeLimit,
            guessLimit,
            tipsLimit,
            continents,
            countries,
            score,
          };
          onFinish(name, data, '');
        }}
        onRequestTutorial={() => setTutorialOpen(true)}
      />

      {(tutorialOpen || !name) && (
        <Tutorial
          name={name}
          timeLimit={timeLimit}
          guessLimit={guessLimit}
          tipsLimit={tipsLimit}
          onClose={() => setTutorialOpen(false)}
          onName={setName}
        />)}
    </>
  )
}

export default App;

// Object.assign(['one', 'two', 'three'], {one: 1, two: 2, three: 3 })
