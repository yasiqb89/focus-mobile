import { MaterialIcons } from "@expo/vector-icons";
import React, { PropsWithChildren } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { brutal, colors, spacing } from "@/design/tokens";
import { PixelText } from "./PixelText";

type BottomSheetProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
}>;

export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} style={styles.scrim}>
          <Pressable accessibilityRole="button" style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(220)}
          exiting={SlideOutDown.duration(160)}
          style={[styles.sheet, brutal.borderThick]}
        >
          <View style={styles.header}>
            <PixelText variant="h2" uppercase numberOfLines={1} style={styles.title}>
              {title}
            </PixelText>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
              <MaterialIcons name="close" size={22} color={colors.primary} />
            </Pressable>
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end"
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.32)"
  },
  sheet: {
    backgroundColor: colors.background,
    gap: spacing.sm,
    maxHeight: "88%",
    padding: spacing.sm
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  title: {
    flex: 1
  },
  close: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44
  }
});
