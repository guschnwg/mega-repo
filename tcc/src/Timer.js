import React, { useContext, useEffect, useRef, useState } from "react";
import { TutorialContext } from "./TutorialContext";

export function Timer({ start, run, limit = 5, onEnd }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef();
  const { setElement } = useContext(TutorialContext);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!run)
        return;

      const next = (Date.now() - start) / 1000;
      if (limit && next > (limit + 1)) {
        onEnd();
      } else {
        setCurrent(next);
      }
    }, 250);
    return () => {
      clearInterval(interval);
    };
  }, [start, run, limit, onEnd]);

  useEffect(() => {
    if (ref.current) {
      setElement('timer', ref.current);
    }

    return () => {
      setElement('timer', null);
    };
  }, [ref, setElement]);

  return (
    <div className="timer" ref={ref} id="timer" data-shake={(current * 100) / limit > 80}>
      ⏱️ {Math.floor(current)} s
    </div>
  );
}
