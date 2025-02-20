import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import data from "@/assets/quotes.json";
import { Calendar } from 'react-native-calendars'; 
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from 'react-native-safe-area-context'; // Add this for safe areas

const arrMin = 1;
const arrMax = data.quotes.length - 1;
const rng = Math.floor(Math.random() * (arrMax - arrMin) + arrMin);
const ranArray = data.quotes[rng];

type Habit = {
    name: string;
    completed: boolean;
};

type MarkedDates = {
    [date: string]: { selected: boolean; marked: boolean; selectedColor: string };
};

// Utility function to calculate streak
const calculateStreak = (markedDates: MarkedDates): number => {
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
  
    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayData = markedDates[dateString];
  
      if (dayData && dayData.selectedColor === '#4CAF50') {
        streak++;
      } else {
        break;
      }
  
      currentDate.setDate(currentDate.getDate() - 1);
      if (streak > 365) break;
    }
  
    return streak;
};

export default function HomeScreen() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [lastResetDate, setLastResetDate] = useState<string>(new Date().toDateString());
    const isFocused = useIsFocused();
    const [markedDates, setMarkedDates] = useState<MarkedDates>({});
    const [streak, setStreak] = useState<number>(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedHabits = await AsyncStorage.getItem('@habits');
                const storedDate = await AsyncStorage.getItem('@lastResetDate');
                const storedMarkedDates = await AsyncStorage.getItem('@markedDates');

                if (storedHabits !== null) {
                    setHabits(JSON.parse(storedHabits));
                }
                if (storedDate !== null) {
                    setLastResetDate(storedDate);
                }
                if (storedMarkedDates !== null) {
                    const loadedMarkedDates = JSON.parse(storedMarkedDates);
                    setMarkedDates(loadedMarkedDates);
                    setStreak(calculateStreak(loadedMarkedDates));
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        if (isFocused) {
            loadData();
        }
    }, [isFocused]);

    useEffect(() => {
        const checkDate = async () => {
            const today = new Date().toDateString();
            if (lastResetDate !== today) {
                const resetHabits = habits.map((habit) => ({ ...habit, completed: false }));
                setHabits(resetHabits);
                setLastResetDate(today);
                await AsyncStorage.setItem('@habits', JSON.stringify(resetHabits));
                await AsyncStorage.setItem('@lastResetDate', today);
            }
        };
        checkDate();
    }, [habits, lastResetDate]);

    const toggleCompletion = (index: number) => {
        const updatedHabits = [...habits];
        updatedHabits[index].completed = !updatedHabits[index].completed;
        setHabits(updatedHabits);
        AsyncStorage.setItem('@habits', JSON.stringify(updatedHabits));
    
        const allCompleted = updatedHabits.every((habit) => habit.completed);
        const today = new Date().toISOString().split('T')[0];
        const updatedMarkedDates = { ...markedDates };
    
        if (allCompleted) {
          updatedMarkedDates[today] = { selected: true, marked: true, selectedColor: '#4CAF50' };
        } else {
          updatedMarkedDates[today] = { selected: true, marked: true, selectedColor: '#F44336' };
        }
    
        setMarkedDates(updatedMarkedDates);
        AsyncStorage.setItem('@markedDates', JSON.stringify(updatedMarkedDates));
        setStreak(calculateStreak(updatedMarkedDates));
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#25292e", "#2f3439", "#1a1d21"]}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <View style={styles.quoteContainer}>
                <Text style={styles.quoteText}>"{ranArray.quote}"</Text>
                <Text style={styles.authorText}>— {ranArray.author}</Text>
              </View>
    
              <View style={styles.calendarContainer}>
                <Calendar
                  markedDates={markedDates}
                  markingType="custom"
                  style={styles.calendar}
                  theme={{
                    calendarBackground: 'transparent',
                    textSectionTitleColor: '#ffffff',
                    todayTextColor: '#FFD700',
                    selectedDayBackgroundColor: '#4CAF50',
                    arrowColor: '#ffffff',
                    monthTextColor: '#ffffff',
                    textDisabledColor: 'rgba(255, 255, 255, 0.3)',
                    dayTextColor: '#ffffff',
                    textDayFontWeight: '400',
                  }}
                />
              </View>

              <View style={styles.streakContainer}>
                <Text style={styles.streakText}>Current Streak: {streak} days</Text>
              </View>

              <Text style={styles.title}>Today's Habits</Text>
              {habits.length === 0 ? (
                <Text style={styles.noHabitsText}>
                  Add habits in the Habit tab to get started!
                </Text>
              ) : (
                habits.map((habit, index) => (
                  <Pressable
                    key={`${habit.name}-${index}`}
                    onPress={() => toggleCompletion(index)}
                    style={({ pressed }) => [
                      styles.habitItem,
                      habit.completed && styles.habitItemCompleted,
                      pressed && styles.habitItemPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.habitText,
                        habit.completed && styles.completedHabitText,
                      ]}
                    >
                      {habit.name}
                    </Text>
                    <FontAwesome
                      name={habit.completed ? 'check-circle' : 'circle-o'}
                      size={24}
                      color={habit.completed ? '#4CAF50' : '#757575'}
                    />
                  </Pressable>
                ))
              )}
            </View>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#25292e', // Match gradient start color to avoid flashes
  },
  contentContainer: {
    padding: 20, // Move padding here for content spacing
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
  },
  quoteContainer: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteText: {
    color: '#ffffff',
    fontSize: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
  },
  authorText: {
    color: '#B0B0B0',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  calendarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habitItemCompleted: {
    backgroundColor: '#E8F5E9',
  },
  habitItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  habitText: {
    fontSize: 18,
    color: '#212121',
    flex: 1,
    fontWeight: '500',
  },
  completedHabitText: {
    textDecorationLine: 'line-through',
    color: '#757575',
  },
  noHabitsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  streakContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    alignItems: 'center',
  },
  streakText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: '600',
  },
});