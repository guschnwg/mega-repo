import WORLD from "./world.json";
import React, { useRef } from "react";
import useMouse from '@react-hook/mouse-position';
import { Flag } from "./Flag";

export const CONTINENTS = Array.from(new Set(WORLD.reduce((agg, crr) => agg.concat([crr.group]), []))).filter(v => v);

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
      onMouseUp={() => !ref.current && !disabled && onClick(country)} />
  );
};
export const World = ({ disabledCountries, selectedCountry, onClick, onMouseEnter, onMouseLeave }) => {
  return (
    <svg
      id='map'
      style={{ backgroundColor: "powderblue" }}
      height={1010}
      width={1010}
    >
      {CONTINENTS.map(continent => (
        <g id={continent} key={continent}>
          {WORLD.filter(c => c.group === continent).map(country => (
            <Country
              key={country.id}
              disabled={disabledCountries.some(d => d.id === country.id)}
              selected={selectedCountry?.id === country.id}
              country={country}
              onClick={onClick}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave} />
          ))}
        </g>
      ))}
    </svg>
  );
};
export const Tooltip = ({ country }) => {
  const mouse = useMouse(document.body);

  if (!country) {
    return null;
  };

  console.log(country)

  return (
    <div
      className="tooltip"
      style={{ top: mouse.clientY + 20, left: mouse.clientX + 10 }}
    >
      {country.name || country.title} <Flag country={country.id} />
    </div>
  );
};
