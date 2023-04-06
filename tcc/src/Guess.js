import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import React, { useState } from "react";
import Modal from 'react-modal';
import { World, Tooltip } from "./World";

export function Guess({ guesses, guessLimit, onGuess, onHide }) {
  const [selectedCountry, setSelectedCountry] = useState();

  return (
    <Modal isOpen>
      <TransformWrapper
        centerOnInit
        doubleClick={{ disabled: true }}
        zoomAnimation={{ disabled: true }}
        wheel={{ disabled: true }}
        // panning={{ disabled: true }}
        initialScale={2}
        disablePadding
      >
        {(utils) => (
          <>
            <div className="guesses-info">
              Você usou {guesses.length} dos {guessLimit} palpites disponíveis
            </div>

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
                onClick={country => onGuess({ time: Date.now(), country })} />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
      <Tooltip country={selectedCountry} />

      <button className="guess-close" onClick={onHide}>X</button>
    </Modal>
  );
}
