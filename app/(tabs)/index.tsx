import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses } from '@/contexts/expense-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function AddExpenseScreen() {
  const [date, setDate] = useState(new Date());
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { addExpense } = useExpenses();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'text');

  const handleSubmit = () => {
    if (!item.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    addExpense({
      date,
      item: item.trim(),
      amount: parsedAmount,
    });

    Alert.alert('Success', 'Expense added successfully');
    setItem('');
    setAmount('');
    setDate(new Date());
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.form}>
          <ThemedView style={styles.field}>
            <ThemedText type="subtitle">Date</ThemedText>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor }]}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText>{formatDate(date)}</ThemedText>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="subtitle">Item</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              value={item}
              onChangeText={setItem}
              placeholder="Enter item name"
              placeholderTextColor="#999"
            />
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="subtitle">Amount</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </ThemedView>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <ThemedText style={styles.submitButtonText}>Add Expense</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
