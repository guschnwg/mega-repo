import { WORLD } from "./world";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useRef, useState } from "react";

import useMouse from '@react-hook/mouse-position';

const Country = ({ country, onClick, onMouseEnter, onMouseLeave }) => {
  const ref = useRef(false);

  return (
    <path
      className='land'
      {...country}
      onMouseEnter={() => onMouseEnter(country)}
      onMouseLeave={() => onMouseLeave(country)}
      // onClick={event => { event.persist(); debugger; onClick(country) }}
      onMouseDown={() => ref.current = false}
      onMouseMove={() => ref.current = true}
      onMouseUp={() => !ref.current && onClick(country)}
    />
  );
}

const World = ({ onClick, onMouseEnter, onMouseLeave }) => (
  <svg id='map' style={{ backgroundColor: "red" }} height={1010} width={1010}>
    <g>
      {WORLD.map(country => <Country key={country.id} country={country} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />)}
    </g>
  </svg>
);

const Tooltip = ({ title }) => {
  const mouse = useMouse(document.body);

  if (!title) {
    return null;
  };

  return (
    <div style={{ position: 'fixed', top: mouse.clientY + 20, left: mouse.clientX + 10, background: "white", zIndex: 99999 }}>{title.title}</div>
  )
}

function App() {
  const [tooltip, setTooltip] = useState();

  return (
    <div>
      <TransformWrapper>
        {(utils) => (
          <>
            <button onClick={() => utils.zoomIn()}>+</button>
            <button onClick={() => utils.zoomOut()}>-</button>
            <button onClick={() => utils.resetTransform()}>x</button>
            <TransformComponent>
              <World
                onMouseEnter={setTooltip}
                onMouseLeave={() => setTooltip(null)}
                onClick={country => alert(country.title)}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
      <Tooltip title={tooltip} />
    </div>
  );
}

export default App;
