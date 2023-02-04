import WORLD from "./world.json";
import GAME from "./game.json";

import 'react-tooltip/dist/react-tooltip.css'


import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Modal from 'react-modal';
import { Tooltip as ReactTooltip } from 'react-tooltip'




import { GoogleMap, StreetViewPanorama, useJsApiLoader } from '@react-google-maps/api';

import useMouse from '@react-hook/mouse-position';

Modal.setAppElement('#modal');


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
    <div className="game-container" id="game-container">
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
    </div>
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
    <div className="timer" ref={ref} id="timer">
      {Math.floor(current)}s
    </div>
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

const TutorialContext = React.createContext();
const Tutorial = ({ active, children }) => {
  const [steps, setSteps] = useState({
    timer: { completed: false, element: null },
    navigation: { completed: false, element: null },
    tips: { completed: false, element: null },
    guess: { completed: false, element: null },
    wrongGuess: { completed: false, element: null },
    rightGuess: { completed: false, element: null },
  });
  const [currentStep, setCurrentStep] = useState('timer');
  const [info, setInfo] = useState(false);

  const setElement = useCallback((step, element) => {
    setSteps(prev => ({ ...prev, [step]: { ...prev[step], element } }));
  }, []);

  const nextStep = () => {
    const possibleSteps = Object.keys(steps);
    const nextStep = possibleSteps.findIndex(s => s === currentStep) + 1;
    setCurrentStep(possibleSteps[nextStep]);
    setInfo(false);
  }

  useEffect(() => {
    if (currentStep) {
      const element = steps?.[currentStep]?.element;
      if (element) {
        const theRealElement = element.mapRef?.parentElement || element;
        theRealElement.dataset.tutorial = 'active';
      }
    }

    return () => {
      if (currentStep) {
        const element = steps?.[currentStep]?.element;
        if (element) {
          const theRealElement = element.mapRef?.parentElement || element;
          theRealElement.dataset.tutorial = 'inactive';
        }
      }
    };
  }, [currentStep, steps]);

  const element = steps?.[currentStep]?.element;
  const theRealElement = element?.mapRef?.parentElement || element;

  return (
    <TutorialContext.Provider
      value={{
        steps,
        setElement,
        nextStep,
      }}
    >
      {children}

      {active && currentStep && (
        <>
          {theRealElement && theRealElement.id && (
            <ReactTooltip anchorId={theRealElement.id} clickable>
              <button className="btn-show-info" onClick={() => setInfo(true)}>
                ?
              </button>
            </ReactTooltip>
          )}
          {info && (
            <Modal
              isOpen
              onRequestClose={() => setInfo(false)}
            >
              INFO

              <button className="btn-show-info" onClick={nextStep}>
                Aprendi
              </button>
            </Modal>
          )}
        </>
      )}
    </TutorialContext.Provider>
  )
}

function Tips({ tips }) {
  const [show, setShow] = useState(false);
  const ref = useRef();
  const { setElement } = useContext(TutorialContext);

  useEffect(() => {
    if (ref.current) {
      setElement('tips', ref.current)
    }
    return () => {
      setElement('tips', null)
    }
  }, [ref, setElement])

  return (
    <>
      <button onClick={() => setShow(true)} id="tips-button" ref={ref}>TIPS</button>
      <Modal isOpen={show} onRequestClose={() => setShow(false)}>
        {JSON.stringify(tips, null, 2)}
      </Modal>
    </>
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

          <Tips
            tips={level.tips}
          />
        </div>

        <StreetView
          key={level}
          country={country}
        />

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
            id="guess-button"
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
    <Tutorial active={level === 0}>
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
