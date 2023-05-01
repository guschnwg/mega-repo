import React, { useEffect, useState } from "react";

export function Timer({ start, active, countdown, limit = 5, onEnd }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!active)
        return;

      const next = (Date.now() - start) / 1000;
      if (limit && next > limit) {
        onEnd();
      } else {
        setCurrent(next);
      }
    }, 250);
    return () => {
      clearInterval(interval);
    };
  }, [start, active, limit, onEnd]);

  const toShow = countdown ? limit - current : current;
  const ensureBetweenLimits = Math.min(Math.max(toShow, 0), limit);

  return (
    <div className="timer" id="timer" data-shake={(current * 100) / limit > 80}>
      ⏱️ {Math.ceil(ensureBetweenLimits)}s
    </div>
  );
}
