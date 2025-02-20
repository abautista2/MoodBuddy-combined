import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import data from "@/assets/quotes.json";
import { Calendar } from 'react-native-calendars'; 
import { LinearGradient } from "expo-linear-gradient";

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
      <LinearGradient
            colors={["#1a1d21", "#2f3439", "#3d4450"]}
            style={styles.gradient}
          >
        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          
            <View style={styles.content}>
              <View style={styles.quoteContainer}>
                <FontAwesome name="lightbulb-o" size={24} color="#FFD700" style={styles.quoteIcon} />
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
                    dotColor: '#4CAF50',
                    markedDotColor: '#FFD700',
                    dotSize: 6,
                    markedDotSize: 8,
                  }}
                />
              </View>

              <View style={styles.streakContainer}>
                <FontAwesome name="fire" size={18} color="#4CAF50" style={styles.streakIcon} />
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
          
        </ScrollView>
      </LinearGradient>
    );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  quoteIcon: {
    marginBottom: 10,
  },
  quoteText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 10,
  },
  authorText: {
    color: '#D3D3D3',
    fontSize: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  calendarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  calendar: {
    borderRadius: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    fontSize: 20,
    color: '#212121',
    flex: 1,
    fontWeight: '500',
  },
  completedHabitText: {
    textDecorationLine: 'line-through',
    color: '#757575',
    opacity: 0.7,
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
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  streakIcon: {
    marginRight: 8,
  },
  streakText: {
    color: '#4CAF50',
    fontSize: 22,
    fontWeight: '700',
  },
});