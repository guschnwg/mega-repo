import React, { useState, useEffect } from "react";
import {
  GestureResponderEvent,
  Pressable,
  Vibration,
  ViewStyle,
  Text,
} from "react-native";
import { styles } from "../styles";
import { Clock } from "./Clock";

interface HoldableProps {
  time?: number;
  disabled?: boolean;
  indicator?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
  onHold: () => void;
}

const Indicator = ({
  start,
  time,
  children,
}: React.PropsWithChildren<{ start: number | null; time: number }>) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let interval = null;
    if (start) {
      interval = setInterval(() => {
        setValue(Date.now() - start);
      }, 50);
    } else {
      setValue(0);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [start, time]);

  return (
    <Clock current={value} max={time}>
      {children}
    </Clock>
  );
};

export const Holdable = ({
  time = 500,
  disabled = false,
  indicator = false,
  style,
  children,
  onHold,
}: HoldableProps) => {
  const [startGesture, setStartGesture] =
    useState<GestureResponderEvent | null>(null);
  const [startDate, setStartDate] = useState<number | null>(null);

  return (
    <Pressable
      style={{
        borderRadius: styles.radius,
        ...style,
        backgroundColor: startGesture ? "#ddd" : style?.backgroundColor,
      }}
      disabled={disabled}
      onLongPress={(event) => {
        if (!startGesture) return;

        event.persist();
        const deltaX = event.nativeEvent.pageX - startGesture.nativeEvent.pageX;
        const deltaY = event.nativeEvent.pageY - startGesture.nativeEvent.pageY;
        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
          Vibration.vibrate(10);
          onHold();
        }
      }}
      delayLongPress={time}
      onPressIn={(event) => {
        event.persist();
        setStartGesture(event);
        setStartDate(Date.now());
      }}
      onTouchMove={(event) => {
        if (!startGesture) return;

        event.persist();
        const deltaX = event.nativeEvent.pageX - startGesture.nativeEvent.pageX;
        const deltaY = event.nativeEvent.pageY - startGesture.nativeEvent.pageY;
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          setStartGesture(null);
          setStartDate(null);
        }
      }}
      onPressOut={() => {
        setStartGesture(null);
        setStartDate(null);
      }}
    >
      {indicator ? (
        <Indicator start={startDate} time={time}>
          {children}
        </Indicator>
      ) : (
        children
      )}
    </Pressable>
  );
};
