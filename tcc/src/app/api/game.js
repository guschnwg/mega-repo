"use server";

import { sql } from "@vercel/postgres";

const finishGame = async (name, game, feedback) => {
  const res = await sql`insert into games (name, data, feedback) values (${name}, ${JSON.stringify(game)}, ${feedback});`;

  return { ok: true, game, data: res.oid };
};

const getGames = async (continents, timeLimit, guessLimit, tipsLimit) => {
  const query = sql`
  SELECT *
  FROM games
  WHERE
    JSON_ARRAY_LENGTH(data->'levels') = ${continents.length}
    AND data->>'timeLimit' = ${timeLimit.toString()}
    AND data->>'guessLimit' = ${guessLimit.toString()}
    AND data->>'tipsLimit' = ${tipsLimit.toString()}
  `
  const data = await query;
  return { ok: true, data: data.rows };
};

export {finishGame, getGames};
