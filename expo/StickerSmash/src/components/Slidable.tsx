import React, { useState, useRef, useEffect } from 'react';
import { NativeTouchEvent, View, ViewStyle, useWindowDimensions } from 'react-native';

interface ValueType {
  time: number
  start: number
  offset: number
  shouldTrigger: boolean
  validation?: {
    passed: boolean
    nativeEvent: NativeTouchEvent
  }
}

const Slidable = ({ style, children, canSlide, onSlideStart, onSlideEnd, onSlide }: React.PropsWithChildren<{ style: ViewStyle, canSlide: boolean, onSlideStart?: () => void, onSlideEnd?: () => void, onSlide: () => void }>) => {
  const [value, setValue] = useState<ValueType>({
    time: 0,
    start: 0,
    offset: 0,
    shouldTrigger: false,
    validation: undefined,
  });
  const removed = useRef(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (!canSlide) {
      setValue({
        time: 0,
        start: 0,
        offset: 0,
        shouldTrigger: false,
        validation: undefined,
      });
    }
  }, [canSlide]);

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
          validation: {
            passed: false,
            nativeEvent: event.nativeEvent,
          },
        });
      }}
      onTouchMove={event => {
        if (!canSlide) return;
        if (!value.validation) return;
        if (!value.validation.passed) {
          const newEvent = event.nativeEvent;
          const deltaX = Math.abs(newEvent.pageX - value.validation.nativeEvent.pageX);
          const deltaY = Math.abs(newEvent.pageY - value.validation.nativeEvent.pageY);
          if (deltaX <= 10) return;
          if (deltaX <= deltaY * 3) return;
        }

        if (!value.validation.passed) {
          onSlideStart?.();
        }

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

          return {
            time: newTime,
            start: crr.start,
            offset: newOffset,
            shouldTrigger, // or shouldTrigger && canSlide and remove if (!canSlide) return;
            validation: {
              passed: true,
              nativeEvent: crr.validation!.nativeEvent,
            }
          };
        })
      }}
      onTouchEnd={() => {
        onSlideEnd?.();
        setValue({ time: 0, start: 0, offset: 0, shouldTrigger: false });
      }}
    >
      {children}
    </View>
  );
}

export { Slidable };
