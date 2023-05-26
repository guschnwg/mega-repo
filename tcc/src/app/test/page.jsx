"use client"

import { useState } from "react"
import { StreetView } from "../../components/StreetView";
import GAME from "../../components/game.json";

const allPlaces = GAME.tutorial.places.concat(GAME.countries.reduce((agg, crr) => [...agg, ...crr.places], []));

export default function Index () {
    const [play, setPlay] = useState(false);
    const [current, setCurrent] = useState(0);

    return (
        <div>
            <button onClick={() => setPlay(true)}>Play</button>
            {play && (
                <audio controls src="https://www.myinstants.com/media/sounds/suspense-drums.mp3"></audio>
            )}

            <div style={{ height: 500 }}>
                <StreetView country={allPlaces[current]} />
            </div>
            <pre>
                {JSON.stringify(allPlaces[current], null, 2)}
            </pre>
            <button onClick={() => setCurrent(prev => prev + 1)}>Next</button>
        </div>
    )
}
