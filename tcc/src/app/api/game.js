"use server";

import { sql } from "@vercel/postgres";

const finishGame = async (name, game, feedback) => {
  await sql`insert into games (name, data, feedback) values (${name}, ${JSON.stringify(game)}, ${feedback});`;

  return { ok: true, game };
};

export default finishGame;
