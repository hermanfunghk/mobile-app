import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ExpenseRecord {
  id: string;
  date: Date;
  item: string;
  amount: number;
}

interface ExpenseContextType {
  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByMonth: (year: number, month: number) => ExpenseRecord[];
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = '@expenses';

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setExpenses(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };

  const saveExpenses = async (newExpenses: ExpenseRecord[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
    } catch (error) {
      console.error('Failed to save expenses:', error);
    }
  };

  const addExpense = (expense: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      ...expense,
      id: Date.now().toString(),
    };
    const newExpenses = [...expenses, newExpense];
    setExpenses(newExpenses);
    saveExpenses(newExpenses);
  };

  const deleteExpense = (id: string) => {
    const newExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(newExpenses);
    saveExpenses(newExpenses);
  };

  const getExpensesByMonth = (year: number, month: number): ExpenseRecord[] => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense, getExpensesByMonth }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
