"use server";

import { sql } from "@vercel/postgres";

const finishGame = async game => {
  await sql`insert into games (name, data) values ('No name yet', ${JSON.stringify(game)});`;

  return { ok: true, game };
};

export default finishGame;
