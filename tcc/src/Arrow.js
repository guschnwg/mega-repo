import React, { useEffect, useState } from "react";


export const Arrow = ({ to }) => {
  const [{ top, left, height, width }, setThing] = useState(to.getBoundingClientRect());

  const style = { top, left };

  const isTop = style.top < window.innerHeight / 2;
  const isLeft = style.left < window.innerWidth / 2;

  useEffect(() => {
    const int = setInterval(() => {
      setThing(to.getBoundingClientRect());
    }, 50);

    return () => {
      clearInterval(int);
    };
  }, [to]);

  if (isTop) {
    style.top += height;
    if (isLeft) {
      style.left += width;
      style.transform = 'rotate(30deg)';
    } else {
      style.transform = 'translateX(-100%) scaleX(-1) rotate(30deg)';
    }
  } else {
    if (isLeft) {
      style.left += width;
      style.transform = 'translateY(-58px) rotate(-30deg)';
    } else {
      style.transform = 'translateY(-58px) translateX(-100%) scaleX(-1) rotate(-30deg)';
    }
  }

  return <div className="the-arrow" style={style} />;
};
