import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Habit = {
  name: string;
  completed: boolean;
};

type Props = {
  label: string;
};

export default function HabitBuilder({ label }: Props) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [text, setText] = useState("");
  const [habitList, setHabitList] = useState<Habit[]>([]);

  // Load habits from AsyncStorage
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const storedHabits = await AsyncStorage.getItem("@habits");
        if (storedHabits !== null) {
          setHabitList(JSON.parse(storedHabits));
        }
      } catch (error) {
        console.error("Error loading habits:", error);
      }
    };
    loadHabits();
  }, []);

  // Save habits to AsyncStorage
  useEffect(() => {
    const saveHabits = async () => {
      try {
        await AsyncStorage.setItem("@habits", JSON.stringify(habitList));
      } catch (error) {
        console.error("Error saving habits:", error);
      }
    };
    saveHabits();
  }, [habitList]);

  // Add a new habit
  const addHandler = () => {
    if (text.trim() !== "") {
      const newHabit: Habit = { name: text, completed: false };
      setHabitList([...habitList, newHabit]);
      setText("");
      setShowConfirmation(false);
    }
  };

  // Remove a habit
  const removeHandler = (habitToRemove: string) => {
    const updatedList = habitList.filter((item) => item.name !== habitToRemove);
    setHabitList(updatedList);
  };

  // Toggle habit completion
  const toggleCompletion = (habitName: string) => {
    setHabitList(
      habitList.map((habit) =>
        habit.name === habitName
          ? { ...habit, completed: !habit.completed }
          : habit
      )
    );
  };

  return (
    <View style={styles.centerAll}>
      {/* Habit List */}
      <View style={styles.listContainer}>
        <Text style={styles.h1}>Habit List</Text>
        {habitList.length === 0 ? (
          <Text style={styles.emptyText}>No habits yet. Add one to start!</Text>
        ) : (
          habitList.map((item, index) => (
            <View key={index} style={styles.habitCard}>
              <Text style={styles.h2}>{item.name}</Text>
              <Pressable onPress={() => removeHandler(item.name)}>
                <FontAwesome name="minus" size={18} color="#FF6F61" />
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* Add Habit Button */}
      <View style={styles.buttonContainer}>
        <Modal
          visible={showConfirmation}
          transparent
          onRequestClose={() => setShowConfirmation(false)}
          animationType="slide"
        >
          <View style={styles.centeredView}>
            <View style={styles.confirmationModal}>
              <View style={styles.confirmationTitle}>
                <Text style={styles.modalTitleText}>Add Habit</Text>
              </View>
              <View style={styles.confirmationBody}>
                <Text style={styles.modalBodyText}>
                  What habit do you want to add?
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new habit here"
                  placeholderTextColor="#D3D3D3"
                  onChangeText={setText}
                  value={text}
                />
              </View>
              <View style={styles.bottomConfirmation}>
                <Pressable
                  onPress={() => setShowConfirmation(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={addHandler} style={styles.confirmationButton}>
                  <Text style={styles.buttonText}>Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Pressable
          style={styles.button}
          onPress={() => setShowConfirmation(true)}
        >
          <FontAwesome name="plus" size={18} color="#25292e" style={styles.buttonIcon} />
          <Text style={styles.buttonLabel}>{label}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerAll: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    width: 320,
    marginBottom: 20,
  },
  h1: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  h2: {
    color: "#FFFFFF",
    fontSize: 18,
    flex: 1, // Allows text to take available space
  },
  habitCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#33373d",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  checkbox: {
    marginRight: 10,
  },
  emptyText: {
    color: "#D3D3D3",
    fontSize: 18,
    textAlign: "center",
  },
  buttonContainer: {
    width: 320,
    height: 60,
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    borderRadius: 10,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#FFD700", // Gold
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonLabel: {
    color: "#25292e",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonIcon: {
    paddingRight: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000099",
  },
  confirmationModal: {
    width: 300,
    height: 300,
    backgroundColor: "#33373d", // Darker modal background
    borderWidth: 1,
    borderColor: "#FFD700", // Gold border
    borderRadius: 20,
  },
  confirmationTitle: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD700", // Gold header
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitleText: {
    color: "#25292e",
    fontSize: 20,
    fontWeight: "bold",
  },
  confirmationBody: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#33373d",
  },
  modalBodyText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    width: 250,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    color: "#FFFFFF",
    backgroundColor: "#25292e",
    marginVertical: 10,
  },
  bottomConfirmation: {
    height: 50,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  confirmationButton: {
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    backgroundColor: "#FF6F61", // Coral for "Add"
    height: "100%",
    borderBottomRightRadius: 20,
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    backgroundColor: "#D3D3D3", // Gray for "Cancel"
    height: "100%",
    borderBottomLeftRadius: 20,
  },
  buttonText: {
    color: "#25292e",
    fontSize: 16,
    fontWeight: "500",
  },
});