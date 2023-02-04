import WORLD from "./world.json";
import GAME from "./game.json";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";


import { GoogleMap, StreetViewPanorama, useJsApiLoader } from '@react-google-maps/api';

import useMouse from '@react-hook/mouse-position';


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
  const ref = useRef();
  const { setElement } = useContext(TutorialContext);

  useEffect(() => {
    if (ref.current) {
      setElement('wrongGuess', ref.current.querySelector('#IN'));
      setElement('rightGuess', ref.current.querySelector('#BR'));
    }

    return () => {
      setElement('wrongGuess', null);
      setElement('rightGuess', null);
    }
  }, [ref, setElement])

  return (
    <svg
      id='map'
      ref={ref}
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
  const { steps, setElement } = useContext(TutorialContext);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    return () => {
      setElement('navigation', null);
    }
  }, [setElement]);

  if (!isLoaded) {
    return null;
  }

  return (
    <GoogleMap
      ref={ref => {
        if (!steps.navigation.element && ref) {
          setElement('navigation', ref);
        }
      }}
      // onUnmount={() => {
      //   debugger;
      //   setElement('navigation', null)
      // }}
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
  const ref = useRef();
  const { setElement } = useContext(TutorialContext);

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

  useEffect(() => {
    if (ref.current) {
      setElement('timer', ref.current);
    }

    return () => {
      setElement('timer', null);
    }
  }, [ref, setElement]);

  return (
    <span id='tutorial-timer' ref={ref}>
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

// function Tutorial({ onSkip }) {
//   const [tutorial, setTutorial] = useState({
//     timer: { show: false, completed: false, ref: null },
//     navigation: { show: false, completed: false, ref: null },
//     tips: { show: false, completed: false, ref: null },
//     guess: { show: false, completed: false, ref: null },
//     wrongGuess: { show: false, completed: false, ref: null },
//     rightGuess: { show: false, completed: false, ref: null },
//     step: 0,
//     steps: ['timer', 'navigation', 'tips', 'guess', 'wrongGuess', 'rightGuess',]
//   });

//   const { Portal } = usePortal()

//   return (
//     <>
//       <button
//         className="skip-tutorial-button"
//         onClick={onSkip}
//       >
//         Pular tutorial
//       </button>
//       <Portal>
//         <div id='tutorial'>
//           This text is portaled at the end of document.body!
//         </div>
//       </Portal>
//     </>
//   );
// }
const TutorialContext = React.createContext();
const Tutorial = ({ show, children }) => {
  const [steps, setSteps] = useState({
    timer: { show: false, completed: false, element: null },
    navigation: { show: false, completed: false, element: null },
    tips: { show: false, completed: false, element: null },
    guess: { show: false, completed: false, element: null },
    wrongGuess: { show: false, completed: false, element: null },
    rightGuess: { show: false, completed: false, element: null },
  });

  const setElement = useCallback((step, element) => {
    setSteps(prev => ({ ...prev, [step]: { ...prev[step], element } }));
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        steps,
        setElement,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

function Game({ level, isTutorial, timeLimit, guessLimit, onChangeLevel }) {

  const [time, setTime] = useState(Date.now());
  const [guesses, setGuesses] = useState([]);
  const [game, setGame] = useState([]);

  const [showGuessAttempt, setShowGuessAttempt] = useState(false);
  const [showRightAttempt, setShowRightAttempt] = useState(false);
  const [showTimeExceeded, setShowTimeExceeded] = useState(false);
  const [showGuessExceeded, setShowGuessExceeded] = useState(false);

  const guessRef = useRef();

  const { setElement } = useContext(TutorialContext);

  //

  const country = GAME.countries[level];

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
    onChangeLevel(level + 1);
    setGame(prev => [...prev, { start: time, country, guesses }]);
    setGuesses([]);
    setTime(Date.now());

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
            ref={guessRef}
            className="guess-button"
            onClick={() => setShowGuessAttempt(true)}
          >
            Já sei!
          </button>
        )}
      </div>
    </>
  );
}

function App() {
  const [level, setLevel] = useState(0);

  return (
    <Tutorial>
      <Game
        level={level}
        isTutorial={level === 0}
        timeLimit={15}
        guessLimit={5}
        onChangeLevel={setLevel}
      />
    </Tutorial>
  )
}

export default App;

// Object.assign(['one', 'two', 'three'], {one: 1, two: 2, three: 3 })
