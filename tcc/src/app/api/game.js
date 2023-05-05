"use server";

const finishGame = async game => {
  return { ok: true, game };
};

export default finishGame;
