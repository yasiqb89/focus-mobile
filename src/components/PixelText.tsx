import React, { PropsWithChildren } from "react";
import { Text, TextProps } from "react-native";
import { colors, typography } from "@/design/tokens";

type PixelTextProps = PropsWithChildren<
  TextProps & {
    variant?: "display" | "h1" | "h2" | "body" | "label";
    muted?: boolean;
    inverted?: boolean;
    uppercase?: boolean;
  }
>;

export function PixelText({
  variant = "body",
  muted,
  inverted,
  uppercase,
  style,
  children,
  ...props
}: PixelTextProps) {
  return (
    <Text
      {...props}
      style={[
        typography[variant],
        {
          color: inverted ? colors.onPrimary : muted ? colors.textMuted : colors.text,
          textTransform: uppercase ? "uppercase" : "none"
        },
        style
      ]}
    >
      {children}
    </Text>
  );
}
