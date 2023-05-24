"use client"

import { useState } from "react"

export default function Index () {
    const [play, setPlay] = useState(false);

    return (
        <div>
            <button onClick={() => setPlay(true)}>Play</button>
            {play && (
                <audio controls src="https://www.myinstants.com/media/sounds/y2mate_YpWYqZD.mp3"></audio>
            )}
        </div>
    )
}
