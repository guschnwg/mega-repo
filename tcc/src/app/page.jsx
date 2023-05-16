"use client";

import Game from './components/Game'

export default function Index({ searchParams }) {
  return <Game params={searchParams} />;
}
