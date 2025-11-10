import React, { useState } from "react";
import { Pressable, Text } from "react-native";

import { SimpleTimer } from "../SimpleTimer";

export const WodWait = ({ onEnd }: { onEnd: (time: number) => void }) => {
  const [time, setTime] = useState(0);

  return (
    <Pressable
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={() => onEnd(time / 1000)}
    >
      <SimpleTimer onProgress={setTime} />

      <Text
        style={{
          flex: 1,
          fontSize: 48,
          textAlign: "center",
          textAlignVertical: "center",
        }}
      >
        Ready to continue?
      </Text>
    </Pressable>
  );
};
