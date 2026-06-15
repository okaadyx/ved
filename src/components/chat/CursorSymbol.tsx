import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

export const CursorSymbol = () => {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, []);

  return (
    <Animated.Text
      style={{
        opacity: blinkAnim,
        fontSize: 16,
        color: "#8B5CF6",
        fontWeight: "bold",
      }}
    >
      ▊
    </Animated.Text>
  );
};
