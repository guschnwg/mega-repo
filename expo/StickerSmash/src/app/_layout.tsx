import React from "react";
import { View, Text } from "react-native";

import { Stack } from "expo-router";

import { Clock } from "@/src/components/Clock";

class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {}

  resetError: () => void = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View>
          <Text>ERROR!</Text>

          <Text>{JSON.stringify(this.state.error, null, 2)}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ErrorBoundary>
  );
}
