import React, { useEffect, useState } from "react";

export function Timer({ start, active, countdown, hideClock = false, limit = 5, houses = 3, onChange, onEnd }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState({ since: start, accumulated: 0, total: 0 });

  useEffect(() => {
    setPaused(prev => ({ ...prev, since: Date.now(), total: prev.total + prev.accumulated, accumulated: 0 }))
  }, [active]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!active) {
        setPaused(prev => ({ ...prev, accumulated: Date.now() - prev.since }));
        return;
      }

      const next = (Date.now() - start - paused.total) / 1000;
      setCurrent(next);
      onChange && onChange(next);
      if (limit && next > limit) {
        onEnd();
      }
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, [start, active, limit, onEnd, onChange, paused]);

  const toShow = countdown ? limit - current : current;
  const ensureBetweenLimits = Math.min(Math.max(toShow, 0), limit);

  return (
    <div className="timer" id="timer" data-shake={(current * 100) / limit > 80}>
      {!hideClock && '⏱️'} {ensureBetweenLimits.toFixed(houses)}s
    </div>
  );
}
