import React, { useEffect, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { colors, typography } from "@/design/tokens";

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

type WheelPickerProps = {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  unit?: string;
};

export function WheelPicker({ values, selected, onSelect, unit = "m" }: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const idx = Math.max(0, values.indexOf(selected));
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), values.length - 1));
    onSelect(values[idx]);
  }

  return (
    <View style={styles.container}>
      {/* Center selection ring */}
      <View style={styles.ring} pointerEvents="none" />
      {/* Top dimmer */}
      <View style={styles.fadeTop} pointerEvents="none" />
      {/* Bottom dimmer */}
      <View style={styles.fadeBottom} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={styles.content}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
      >
        {values.map((val) => {
          const isSelected = val === selected;
          return (
            <TouchableOpacity
              key={val}
              activeOpacity={0.7}
              style={styles.item}
              onPress={() => {
                const idx = values.indexOf(val);
                onSelect(val);
                scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
              }}
            >
              <Text style={[styles.label, isSelected ? styles.labelSelected : styles.labelMuted]}>
                {val}
                <Text style={[styles.unit, isSelected ? styles.labelSelected : styles.labelMuted]}>
                  {unit}
                </Text>
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    overflow: "hidden"
  },
  content: {
    paddingVertical: ITEM_HEIGHT * 2
  },
  item: {
    alignItems: "center",
    height: ITEM_HEIGHT,
    justifyContent: "center"
  },
  label: {
    ...typography.h1,
    textAlign: "center"
  },
  labelSelected: {
    color: colors.primary
  },
  labelMuted: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: "500",
    opacity: 0.4
  },
  unit: {
    fontSize: 16,
    fontWeight: "600"
  },
  ring: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
    borderTopColor: colors.primary,
    borderTopWidth: 2,
    height: ITEM_HEIGHT,
    left: 0,
    position: "absolute",
    right: 0,
    top: ITEM_HEIGHT * 2,
    zIndex: 2
  },
  fadeTop: {
    backgroundColor: colors.background,
    height: ITEM_HEIGHT * 2,
    left: 0,
    opacity: 0.88,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 3
  },
  fadeBottom: {
    backgroundColor: colors.background,
    bottom: 0,
    height: ITEM_HEIGHT * 2,
    left: 0,
    opacity: 0.88,
    position: "absolute",
    right: 0,
    zIndex: 3
  }
});
