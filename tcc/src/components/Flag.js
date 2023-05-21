'use client';
import React from "react";

export const Flag = ({ country }) => (
  <div className="flag">
    <img alt="Bandeira" src={`https://cdn.jsdelivr.net/gh/hampusborgos/country-flags@main/svg/${country.toLowerCase()}.svg`} />
  </div>
);
