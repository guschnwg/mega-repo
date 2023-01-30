import WORLD from "./world.json";
import GAME from "./game.json";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useEffect, useRef, useState } from "react";


import { GoogleMap, StreetViewPanorama, useJsApiLoader } from '@react-google-maps/api';

import useMouse from '@react-hook/mouse-position';
import usePortal from 'react-useportal'


const Country = ({ country, disabled, selected, onClick, onMouseEnter, onMouseLeave }) => {
  const ref = useRef(false);

  return (
    <path
      className={`land ${selected && 'selected'} ${disabled && 'disabled'} ${country.continent}`}
      {...country}
      onMouseEnter={() => onMouseEnter(country)}
      onMouseLeave={() => onMouseLeave(country)}
      onMouseDown={() => ref.current = false}
      onMouseMove={() => ref.current = true}
      onMouseUp={() => !ref.current && onClick(country)}
    />
  );
}

const World = ({ disabledCountries, selectedCountry, onClick, onMouseEnter, onMouseLeave }) => {
  return (
    <svg
      id='map'
      style={{ backgroundColor: "powderblue" }}
      height={1010}
      width={1010}
    >
      <g>
        {WORLD.map(country => (
          <Country
            key={country.id}
            disabled={disabledCountries.some(d => d.id === country.id)}
            selected={selectedCountry?.id === country.id}
            country={country}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        ))}
      </g>
    </svg>
  );
};

const Tooltip = ({ country }) => {
  const mouse = useMouse(document.body);

  if (!country) {
    return null;
  };

  return (
    <div
      className="tooltip"
      style={{ top: mouse.clientY + 20, left: mouse.clientX + 10 }}
    >
      {country.name || country.title}
    </div>
  )
}

function Guess({ guesses, onGuess, onHide }) {
  const [selectedCountry, setSelectedCountry] = useState();

  return (
    <div className='guess-container'>
      <TransformWrapper
        centerOnInit
        doubleClick={{ disabled: true }}
        zoomAnimation={{ disabled: true }}
        disablePadding
      >
        {(utils) => (
          <>
            <div className='controls'>
              <button onClick={() => utils.zoomIn()}>+</button>
              <button onClick={() => utils.zoomOut()}>-</button>
            </div>

            <TransformComponent>
              <World
                disabledCountries={guesses.filter(g => !g.isRight).map(g => g.data.country)}
                selectedCountry={selectedCountry}
                onMouseEnter={setSelectedCountry}
                onMouseLeave={() => setSelectedCountry(null)}
                onClick={country => onGuess({ time: Date.now(), country })}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
      <Tooltip country={selectedCountry} />

      <button className="guess-close" onClick={onHide}>X</button>
    </div>
  );
}

function StreetView({ country }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) {
    return null;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ height: '100%', width: '100%' }}
    >
      <StreetViewPanorama
        options={{
          position: country.coordinates,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          visible: true,
          enableCloseButton: false,
        }}
      />
    </GoogleMap>
  )
}

function EndGame({ game }) {
  return (
    <pre>
      {JSON.stringify(game, null, 2)}
    </pre>
  );
}

function Timer({ start, run, limit = 5, onEnd }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!run) return;

      const next = (Date.now() - start) / 1000;
      if (limit && next > (limit + 1)) {
        onEnd();
      } else {
        setCurrent(next);
      }
    }, 250);
    return () => {
      clearInterval(interval);
    }
  }, [start, run, limit, onEnd]);

  return (
    <span id='tutorial-timer'>
      {Math.floor(current)}s
    </span>
  );
}

function RightAttempt({ onNext }) {
  return (
    <div className='guess-container'>
      OIOI
      <button onClick={onNext}>Próximo nível</button>
    </div>
  )
}

function TimeExceeded({ onNext }) {
  return (
    <div className='guess-container'>
      FUCK
      <button onClick={onNext}>Próximo nível</button>
    </div>
  )
}

function GuessExceeded({ onNext }) {
  return (
    <div className='guess-container'>
      FUCK
      <button onClick={onNext}>Próximo nível</button>
    </div>
  )
}

function Tutorial({ onSkip }) {
  const [tutorial, setTutorial] = useState({
    timer: { show: false, completed: false },
    navigation: { show: false, completed: false },
    tips: { show: false, completed: false },
    guess: { show: false, completed: false },
    wrongGuess: { show: false, completed: false },
    rightGuess: { show: false, completed: false },
    step: 0,
    steps: ['timer', 'navigation', 'tips', 'guess', 'wrongGuess', 'rightGuess',]
  });

  const { Portal } = usePortal()

  return (
    <>
      <button
        className="skip-tutorial-button"
        onClick={onSkip}
      >
        Pular tutorial
      </button>
      <Portal>
        <div id='tutorial'>
          This text is portaled at the end of document.body!
        </div>
      </Portal>
    </>
  );
}

function Game({ timeLimit, guessLimit }) {
  const [level, setLevel] = useState(0);
  const [time, setTime] = useState(Date.now());
  const [guesses, setGuesses] = useState([]);
  const [game, setGame] = useState([]);

  const [showGuessAttempt, setShowGuessAttempt] = useState(false);
  const [showRightAttempt, setShowRightAttempt] = useState(false);
  const [showTimeExceeded, setShowTimeExceeded] = useState(false);
  const [showGuessExceeded, setShowGuessExceeded] = useState(false);

  const country = GAME.countries[level];
  const isTutorial = level === 0;

  const canGuess = !showGuessAttempt && !showRightAttempt && !showTimeExceeded && !showGuessExceeded;
  const timeRunning = !showTimeExceeded && !showRightAttempt && !showGuessExceeded;

  const handleGuess = guess => {
    const isRight = guess.country.id === country.country;
    setGuesses(prev => [...prev, { data: guess, isRight }]);

    if (isRight) {
      setShowGuessAttempt(false);
      setShowRightAttempt(true);
    }

    if (!isTutorial && guesses.length + 1 >= guessLimit) {
      setShowGuessExceeded(true);
    }
  }

  const handleNext = () => {
    setLevel(prev => prev + 1);
    setGame(prev => [...prev, { start: time, country, guesses }]);
    setGuesses([]);
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
    <div className='app'>
      <div>
        <Timer
          start={time}
          run={timeRunning}
          limit={!isTutorial && timeLimit}
          onEnd={() => {
            setShowTimeExceeded(true);
            setShowGuessAttempt(false);
          }}
        />
      </div>

      <div className="game-container">
        <StreetView
          key={level}
          country={country}
        />
      </div>

      {showGuessAttempt && (
        <Guess
          guesses={guesses}
          onGuess={handleGuess}
          onHide={() => setShowGuessAttempt(false)}
        />
      )}

      {showRightAttempt && <RightAttempt onNext={handleNext} />}

      {showTimeExceeded && <TimeExceeded onNext={handleNext} />}

      {showGuessExceeded && <GuessExceeded onNext={handleNext} />}

      {canGuess && (
        <button
          className="guess-button"
          onClick={() => setShowGuessAttempt(true)}
        >
          Já sei!
        </button>
      )}

      {isTutorial && <Tutorial onSkip={handleNext} />}
    </div>
  );
}

function App() {
  return (
    <Game
      timeLimit={15}
      guessLimit={5}
    />
  )
}

export default App;

// Object.assign(['one', 'two', 'three'], {one: 1, two: 2, three: 3 })
