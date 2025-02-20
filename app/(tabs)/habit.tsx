import { View, StyleSheet } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import HabitBuilder from "@/components/HabitBuilder";

export default function Habit() {
  return (
    <LinearGradient
      colors={["#25292e", "#2f3439", "#1a1d21"]} // Subtle dark gradient
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <HabitBuilder label="Add a habit" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});