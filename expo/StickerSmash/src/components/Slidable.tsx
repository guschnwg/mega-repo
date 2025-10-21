import React, { useState, useRef } from 'react';
import { View, ViewStyle, useWindowDimensions } from 'react-native';

const Slidable = ({ style, children, canSlide, onSlide }: React.PropsWithChildren<{ style: ViewStyle, canSlide: boolean, onSlide: () => void }>) => {
  const [value, setValue] = useState({
    time: 0,
    start: 0,
    offset: 0,
    shouldTrigger: false,
  });
  const removed = useRef(false);
  const { width } = useWindowDimensions();

  if (value.shouldTrigger) {
    setTimeout(() => {
      if (!removed.current) onSlide();
      removed.current = true;
    }, 100);
    return null;
  }

  return (
    <View
      style={{
        left: value.offset,
        opacity: 1 - value.offset / (width - value.start),
        ...style,
      }}
      onTouchStart={event => {
        event.persist();
        setValue({
          time: Date.now(),
          start: event.nativeEvent.pageX,
          offset: 0,
          shouldTrigger: false,
        })
      }}
      onTouchMove={event => {
        if (!canSlide) return;

        event.persist();
        setValue(crr => {
          const newValue = event.nativeEvent.pageX;
          const newTime = Date.now();
          const newOffset = newValue - crr.start;
          const changeOffset = Math.abs(newOffset - crr.offset);
          const velocity = changeOffset / (newTime - crr.time);

          const thirdWidth = width / 3;
          const tooFastAndOverThreshold = (newOffset > thirdWidth && velocity > 3);
          const kindaOutOfBounds = crr.start < 2 * thirdWidth && newValue > width - 50;
          const shouldTrigger = tooFastAndOverThreshold || kindaOutOfBounds;

          const theNewOne = {
            time: newTime,
            start: crr.start,
            offset: newOffset,
            shouldTrigger, // or shouldTrigger && canSlide and remove if (!canSlide) return;
          };
          return theNewOne;
        })
      }}
      onTouchEnd={() => setValue({ time: 0, start: 0, offset: 0, shouldTrigger: false })}
    >
      {children}
    </View>
  );
}

export { Slidable };
