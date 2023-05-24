"use client";

import App, {getGame} from '../components/App';
import { getConfig } from "../utils/config";
import { finishGame } from './api/game';

export default function Game({ searchParams }) {
  const { continents, ...config } = getConfig(searchParams);
  return (
    <App
      {...config}
      continents={continents}
      countries={getGame(continents)}
      onFinish={async (name, game, feedback) => {
        const res = await finishGame(name, game, feedback);
        console.log(res);
      }}
    />
  );
}
