import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import React, { useState } from "react";
import Modal from 'react-modal';
import { World, Tooltip } from "./World";

export function Guess({ guesses, guessLimit, onlyOnce, onGuess, onHide }) {
  const [selectedCountry, setSelectedCountry] = useState();
  const [canGuess, setCanGuess] = useState(true);

  const betweenBounds = (utils, desiredPositionX, desiredPositionY) => {
    const bounds = utils.instance.bounds;

    const newPositionX = Math.min(Math.max(bounds.minPositionX, desiredPositionX), bounds.maxPositionX);
    const newPositionY = Math.min(Math.max(bounds.minPositionY, desiredPositionY), bounds.maxPositionY);

    utils.setTransform(newPositionX, newPositionY, utils.state.scale, null);
  }

  return (
    <Modal isOpen>
      <TransformWrapper
        doubleClick={{ disabled: true }}
        disablePadding
        centerOnInit
        centerZoomedOut
      >
        {(utils) => (
          <>
            <div className="guesses-info">
              Você usou {guesses.length} dos {guessLimit} palpites disponíveis.
            </div>

            {!canGuess && (
              <Modal isOpen className="already-guessed" overlayClassName="already-guessed-overlay">
                <p>Você deu o palpite nesta rodada.</p>
                <p>Infelizmente não é {guesses.at(-1).data.country.name}...</p>
                <p>Vamos tentar de novo?</p>

                <button onClick={onHide}>Vamos!</button>
              </Modal>
            )}

            <div className="controls zoom">
              <button onClick={() => utils.zoomIn(.5, null)}>+</button>
              <button onClick={() => utils.zoomOut(.5, null)}>-</button>
            </div>

            <div className="controls position">
              <button
                className="top"
                onClick={() => betweenBounds(utils, utils.state.positionX, utils.state.positionY + 100)}
              >
                <svg fill="white" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.787 9.473s-4.505-4.502-6.259-6.255c-.147-.146-.339-.22-.53-.22-.192 0-.384.074-.531.22-1.753 1.753-6.256 6.252-6.256 6.252-.147.147-.219.339-.217.532.001.19.075.38.221.525.292.293.766.295 1.056.004l4.977-4.976v14.692c0 .414.336.75.75.75.413 0 .75-.336.75-.75v-14.692l4.978 4.978c.289.29.762.287 1.055-.006.145-.145.219-.335.221-.525.002-.192-.07-.384-.215-.529z" fillRule="nonzero" /></svg>
              </button>
              <button
                className="left"
                onClick={() => betweenBounds(utils, utils.state.positionX + 100, utils.state.positionY)}
              >
                <svg fill="white" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" fillRule="nonzero" /></svg>
              </button>
              <button
                className="right"
                onClick={() => betweenBounds(utils, utils.state.positionX - 100, utils.state.positionY)}
              >
                <svg fill="white" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m14.523 18.787s4.501-4.505 6.255-6.26c.146-.146.219-.338.219-.53s-.073-.383-.219-.53c-1.753-1.754-6.255-6.258-6.255-6.258-.144-.145-.334-.217-.524-.217-.193 0-.385.074-.532.221-.293.292-.295.766-.004 1.056l4.978 4.978h-14.692c-.414 0-.75.336-.75.75s.336.75.75.75h14.692l-4.979 4.979c-.289.289-.286.762.006 1.054.148.148.341.222.533.222.19 0 .378-.072.522-.215z" fillRule="nonzero" /></svg>
              </button>
              <button
                className="bottom"
                onClick={() => betweenBounds(utils, utils.state.positionX, utils.state.positionY - 100)}
              >
                <svg fill="white" clipRule="evenodd" fillRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m5.214 14.522s4.505 4.502 6.259 6.255c.146.147.338.22.53.22s.384-.073.53-.22c1.754-1.752 6.249-6.244 6.249-6.244.144-.144.216-.334.217-.523 0-.193-.074-.386-.221-.534-.293-.293-.766-.294-1.057-.004l-4.968 4.968v-14.692c0-.414-.336-.75-.75-.75s-.75.336-.75.75v14.692l-4.979-4.978c-.289-.289-.761-.287-1.054.006-.148.148-.222.341-.221.534 0 .189.071.377.215.52z" fillRule="nonzero" /></svg>
              </button>
            </div>

            <TransformComponent>
              <World
                disabledCountries={guesses.filter(g => !g.isRight).map(g => g.data.country)}
                selectedCountry={selectedCountry}
                onMouseEnter={setSelectedCountry}
                onMouseLeave={() => setSelectedCountry(null)}
                onClick={country => {
                  if (canGuess) {
                    onGuess({ time: Date.now(), country });
                    if (onlyOnce) {
                      setCanGuess(false);
                    }
                  }
                }}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
      <Tooltip country={selectedCountry} />

      <button className="guess-close" onClick={onHide}>X</button>
    </Modal>
  );
}
