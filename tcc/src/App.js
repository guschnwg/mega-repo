import WORLD from "./world.json";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useRef, useState } from "react";

import useMouse from '@react-hook/mouse-position';

const Country = ({ country, selected, onClick, onMouseEnter, onMouseLeave }) => {
  const ref = useRef(false);

  return (
    <path
      className={`land ${selected && 'selected'} ${country.continent}`}
      {...country}
      onMouseEnter={() => onMouseEnter(country)}
      onMouseLeave={() => onMouseLeave(country)}
      onMouseDown={() => ref.current = false}
      onMouseMove={() => ref.current = true}
      onMouseUp={() => !ref.current && onClick(country)}
    />
  );
}

const World = ({ selectedCountry, onClick, onMouseEnter, onMouseLeave }) => {
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

function Guess() {
  const [selectedCountry, setSelectedCountry] = useState();

  return (
    <div id='guess-container'>
      <TransformWrapper
        initialScale={4}
        centerOnInit
        doubleClick={{ disabled: true }}
        zoomAnimation={{ disabled: true }}
      >
        {(utils) => (
          <>
            <div className='controls'>
              <button onClick={() => utils.zoomIn()}>+</button>
              <button onClick={() => utils.zoomOut()}>-</button>
            </div>

            <TransformComponent>
              <World
                selectedCountry={selectedCountry}
                onMouseEnter={setSelectedCountry}
                onMouseLeave={() => setSelectedCountry(null)}
                onClick={country => alert(country.title)}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
      <Tooltip country={selectedCountry} />
    </div>
  );
}

function App() {
  return (
    <div>
      <Guess />
    </div>
  )
}

export default App;
