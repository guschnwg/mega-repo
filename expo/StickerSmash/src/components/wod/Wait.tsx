import React from "react";
import { Pressable, Text, View } from "react-native";

import { Timer } from "../Timer";
import { Clock } from "../Clock";
import { styles } from "@/src/styles";
import { OurButton } from "../OurButton";

export const WodWait = ({ onEnd }: { onEnd: (time: number) => void }) => {
  return (
    <Timer>
      {(start, current, minutes, seconds) => (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: styles.background,
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock
              current={current - start}
              max={60000}
              size={300}
              tickness={12}
              label={`${String(Math.floor(minutes)).padStart(2, "0")}:${String(Math.floor(seconds)).padStart(2, "0")}`}
            />
          </View>

          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <Text
              style={{
                fontSize: 48,
                color: styles.textDark,
                textAlign: "center",
              }}
            >
              Ready to continue?
            </Text>

            <OurButton
              title="Let's go!"
              onPress={() => onEnd(current - start)}
            />
          </View>
        </View>
      )}
    </Timer>
  );
};
