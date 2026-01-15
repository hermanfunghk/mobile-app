import React, { useState, useMemo, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useExpenses, ExpenseRecord } from '@/contexts/expense-context';
import { useThemeColor } from '@/hooks/use-theme-color';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function ExpenseRow({
  expense,
  borderColor,
  onDelete,
}: {
  expense: ExpenseRecord;
  borderColor: string;
  onDelete: (id: string) => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete(expense.id);
  };

  const renderRightActions = () => {
    return (
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
    >
      <View style={[styles.tableRow, { borderBottomColor: borderColor }]}>
        <ThemedText style={[styles.cell, styles.dateColumn]}>
          {formatDate(expense.date)}
        </ThemedText>
        <ThemedText style={[styles.cell, styles.itemColumn]} numberOfLines={1}>
          {expense.item}
        </ThemedText>
        <ThemedText style={[styles.cell, styles.amountColumn]}>
          {formatAmount(expense.amount)}
        </ThemedText>
      </View>
    </Swipeable>
  );
}

export default function HistoryScreen() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());

  const { getExpensesByMonth, deleteExpense } = useExpenses();
  const borderColor = useThemeColor({ light: '#ddd', dark: '#333' }, 'text');

  const expenses = useMemo(() => {
    return getExpensesByMonth(selectedYear, selectedMonth).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [selectedYear, selectedMonth, getExpensesByMonth]);

  const total = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  }, []);

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.selector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearButton,
                selectedYear === year && styles.selectedButton,
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <ThemedText
                style={[
                  styles.yearText,
                  selectedYear === year && styles.selectedText,
                ]}
              >
                {year}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
          {MONTHS.map((month, index) => (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthButton,
                selectedMonth === index && styles.selectedButton,
              ]}
              onPress={() => setSelectedMonth(index)}
            >
              <ThemedText
                style={[
                  styles.monthText,
                  selectedMonth === index && styles.selectedText,
                ]}
              >
                {month.slice(0, 3)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.summary}>
        <ThemedText type="subtitle">
          {MONTHS[selectedMonth]} {selectedYear}
        </ThemedText>
        <ThemedText type="defaultSemiBold">
          Total: {formatAmount(total)}
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.tableContainer}>
        <ThemedView style={[styles.tableHeader, { borderBottomColor: borderColor }]}>
          <ThemedText style={[styles.headerCell, styles.dateColumn]}>Date</ThemedText>
          <ThemedText style={[styles.headerCell, styles.itemColumn]}>Item</ThemedText>
          <ThemedText style={[styles.headerCell, styles.amountColumn]}>Amount</ThemedText>
        </ThemedView>

        {expenses.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText>No expenses for this month</ThemedText>
          </ThemedView>
        ) : (
          expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              borderColor={borderColor}
              onDelete={deleteExpense}
            />
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selector: {
    paddingVertical: 12,
    gap: 8,
  },
  yearScroll: {
    paddingHorizontal: 16,
  },
  monthScroll: {
    paddingHorizontal: 16,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  monthButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  monthText: {
    fontSize: 13,
  },
  selectedText: {
    color: '#fff',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  headerCell: {
    fontWeight: '600',
  },
  cell: {
    fontSize: 14,
  },
  dateColumn: {
    width: 70,
  },
  itemColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  amountColumn: {
    width: 80,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 1,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
