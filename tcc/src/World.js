import WORLD from "./world.json";
import React, { useContext, useEffect, useRef } from "react";
import useMouse from '@react-hook/mouse-position';
import { TutorialContext } from "./TutorialContext";

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
      onMouseUp={() => !ref.current && onClick(country)} />
  );
};
export const World = ({ disabledCountries, selectedCountry, onClick, onMouseEnter, onMouseLeave }) => {
  const ref = useRef();
  const { steps, currentStep, setElement, nextStep } = useContext(TutorialContext);

  useEffect(() => {
    if (ref.current) {
      setElement('wrongGuess', ref.current.querySelector('#MG'));
      setElement('rightGuess', ref.current.querySelector('#BR'));
    }

    return () => {
      setElement('wrongGuess', null);
      setElement('rightGuess', null);
    };
  }, [ref, setElement]);

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
            onClick={country => {
              if (currentStep === 'wrongGuess' && country.id !== 'MG') {
                return;
              }
              if (currentStep === 'rightGuess' && country.id !== 'BR') {
                return;
              }
              nextStep();
              onClick(country);
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave} />
        ))}
      </g>
    </svg>
  );
};
export const Tooltip = ({ country }) => {
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
  );
};
