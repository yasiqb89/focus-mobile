import React, { Component, ErrorInfo, PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/design/tokens";
import { PixelButton } from "./PixelButton";
import { PixelCard } from "./PixelCard";
import { PixelText } from "./PixelText";

type State = { error: Error | null };

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Focus] Uncaught error:", error.message, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.container}>
        <PixelCard thick style={styles.card}>
          <PixelText variant="h1" uppercase>
            Something Broke
          </PixelText>
          <View style={styles.message}>
            <PixelText muted>{this.state.error.message}</PixelText>
          </View>
          <PixelButton
            label="Retry"
            icon="refresh"
            variant="primary"
            onPress={() => this.setState({ error: null })}
          />
        </PixelCard>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.md
  },
  card: {
    gap: spacing.sm
  },
  message: {
    borderLeftColor: colors.error,
    borderLeftWidth: 2,
    paddingLeft: spacing.sm
  }
});
