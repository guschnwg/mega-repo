'use client';

import GAME from "./game.json";

export default function Debug() {
  return (
    <div>
      {GAME.countries.map(country => (
        <div className="flag">
          {country.country}
          <img
            alt="Bandeira"
            src={`https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/${country.country.toLowerCase()}.svg`}
          />
        </div>
      ))}
    </div>
  )
}