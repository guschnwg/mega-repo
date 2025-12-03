import React from "react";
import { ScrollView, Text, View } from "react-native";

import { styles } from "../styles";

import { OurButton } from "@/src/components/OurButton";
import { LayoutAware } from "@/src/components/LayoutAware";
import { Chart } from "@/src/components/Chart";
import { Header } from "@/src/components/Header";

export const EndWod = ({
  steps,
  onReset,
}: {
  steps: StepType[];
  onReset: () => void;
}) => (
  <View
    style={{
      flex: 1,
      gap: 10,
    }}
  >
    <Header
      style={{
        justifyContent: "space-between",
        paddingInline: 20,
      }}
    >
      <View
        style={{
          flexDirection: "column",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Text
            style={{
              fontSize: 36,
              color: styles.textLight,
            }}
          >
            Your WOD
          </Text>

          <OurButton
            title="✏️"
            titleStyle={{
              fontSize: 12,
              transform: "scaleX(-1)",
            }}
            variant="secondary-inverted"
            onPress={() => {}}
          />
        </View>
        <Text
          style={{
            fontSize: 16,
            color: styles.textLight,
          }}
        >
          {new Date().toLocaleDateString(undefined, { dateStyle: "long" })} at{" "}
          {new Date().toLocaleTimeString(undefined, { timeStyle: "short" })}
        </Text>
      </View>

      <OurButton
        title="😴"
        titleStyle={{
          fontSize: 28,
        }}
        onPress={onReset}
      />
    </Header>

    <ScrollView
      style={{
        flex: 1,
        backgroundColor: styles.background,
      }}
      contentContainerStyle={{
        flexDirection: "column",
        gap: 20,
        paddingInline: 10,
        paddingBlock: 20,
      }}
    >
      {steps.map((step, i) => {
        if (step.type === "Rest") {
          return (
            <View
              key={i}
              style={{
                gap: 10,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Rested for {(step.config.actual || step.config.time) / 1000}s
              </Text>
            </View>
          );
        }
        if (step.type === "Wait") {
          return (
            <View
              key={i}
              style={{
                gap: 10,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Waited for {(step.config.actual || step.config.time) / 1000}s
              </Text>
            </View>
          );
        }
        if (step.type === "AMRAP") {
          return (
            <View
              key={i}
              style={{
                gap: 10,
              }}
            >
              <Text style={{ textAlign: "center" }}>
                <Text style={{ fontWeight: "bold" }}>AMRAP</Text> of{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {step.config.counter.value}
                </Text>{" "}
                reps in{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {step.config.time / 1000}
                </Text>
                s
              </Text>

              <LayoutAware height={100}>
                {({ ready, ...rest }) =>
                  ready && (
                    <Chart
                      {...rest}
                      counter={step.config.counter}
                      currentTime={step.config.time}
                      endTime={step.config.time}
                      showGridHint
                    />
                  )
                }
              </LayoutAware>
            </View>
          );
        }
        if (step.type === "EMOM") {
          const groupsOf = 3;
          const countersGrouped: EMOMConfigCounterType[][] =
            step.config.counters.reduce((agg, crr, idx) => {
              const aggIdx = Math.floor(idx / groupsOf);
              agg[aggIdx] = agg[aggIdx] || [];
              agg[aggIdx].push(crr);
              return agg;
            }, []);
          return (
            <View
              key={i}
              style={{
                gap: 10,
              }}
            >
              <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                EMOM
              </Text>

              <View
                style={{
                  gap: 10,
                  flex: 1,
                }}
              >
                {countersGrouped.map((counters, i) => (
                  <React.Fragment key={i}>
                    <View
                      style={{
                        gap: 10,
                        flex: 1,
                        flexDirection: "row",
                      }}
                    >
                      {counters.map((counter, j) => (
                        <Text
                          key={j}
                          style={{ flex: 1, textAlign: "center" }}
                        >
                          <Text
                            style={{
                              fontWeight: "bold",
                              color:
                                counter.value !== counter.max
                                  ? "red"
                                  : undefined,
                            }}
                          >
                            {counter.value === counter.max
                              ? counter.value
                              : counter.value - counter.max}
                          </Text>{" "}
                          reps in{" "}
                          <Text style={{ fontWeight: "bold" }}>
                            {counter.time / 1000}
                          </Text>
                          s
                        </Text>
                      ))}
                      {[...Array(groupsOf - counters.length).keys()].map(
                        (k, i) => (
                          <View
                            key={i}
                            style={{ flex: 1 }}
                          />
                        ),
                      )}
                    </View>
                    <LayoutAware height={100}>
                      {({ ready, width, height }) =>
                        ready && (
                          <View
                            style={{
                              gap: 10,
                              flexDirection: "row",
                            }}
                          >
                            {counters.map((counter, j) => (
                              <View
                                key={j}
                                style={{
                                  height: height,
                                  width:
                                    width / groupsOf -
                                    (10 * (groupsOf - 1)) / 3,
                                }}
                              >
                                <Chart
                                  width={
                                    width / groupsOf - (10 * (groupsOf - 1)) / 3
                                  }
                                  height={height}
                                  counter={counter}
                                  currentTime={counter.time}
                                  endTime={counter.time}
                                  absoluteMax
                                />
                              </View>
                            ))}
                          </View>
                        )
                      }
                    </LayoutAware>
                  </React.Fragment>
                ))}
              </View>
            </View>
          );
        }
        if (step.type === "Set") {
          const groupsOf = 3;
          const countersGrouped: CounterType[][] = step.config.counters.reduce(
            (agg, crr, idx) => {
              const aggIdx = Math.floor(idx / groupsOf);
              agg[aggIdx] = agg[aggIdx] || [];
              agg[aggIdx].push(crr);
              return agg;
            },
            [] as CounterType[][],
          );
          return (
            <View
              key={i}
              style={{
                gap: 10,
              }}
            >
              <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                Set
              </Text>

              <View
                style={{
                  gap: 10,
                  flex: 1,
                }}
              >
                {countersGrouped.map((counters, i) => (
                  <React.Fragment key={i}>
                    <View
                      style={{
                        gap: 10,
                        flex: 1,
                        flexDirection: "row",
                      }}
                    >
                      {counters.map((counter, j) => (
                        <Text
                          key={j}
                          style={{ flex: 1, textAlign: "center" }}
                        >
                          <Text style={{ fontWeight: "bold" }}>
                            {counter.value}
                          </Text>{" "}
                          reps in{" "}
                          <Text style={{ fontWeight: "bold" }}>
                            {!counter.history.length
                              ? "?"
                              : counter.history[counter.history.length - 1] /
                                1000}
                          </Text>
                          s
                        </Text>
                      ))}
                      {[...Array(groupsOf - counters.length).keys()].map(
                        (k, i) => (
                          <View
                            key={i}
                            style={{ flex: 1 }}
                          />
                        ),
                      )}
                    </View>
                    <LayoutAware height={100}>
                      {({ ready, width, height }) =>
                        ready && (
                          <View
                            style={{
                              gap: 10,
                              flexDirection: "row",
                            }}
                          >
                            {counters.map((counter, j) => (
                              <View
                                key={j}
                                style={{
                                  height: height,
                                  width:
                                    width / groupsOf -
                                    (10 * (groupsOf - 1)) / 3,
                                }}
                              >
                                <Chart
                                  width={
                                    width / groupsOf - (10 * (groupsOf - 1)) / 3
                                  }
                                  height={height}
                                  counter={counter}
                                  endTime={
                                    counter.history
                                      ? counter.history[
                                          counter.history.length - 1
                                        ] * 1.1
                                      : 0
                                  }
                                  absoluteMax
                                />
                              </View>
                            ))}
                          </View>
                        )
                      }
                    </LayoutAware>
                  </React.Fragment>
                ))}
              </View>
            </View>
          );
        }

        return (
          <Text key={i}>
            Not implemented yet {JSON.stringify(step, null, 2)}
          </Text>
        );
      })}
    </ScrollView>
  </View>
);
