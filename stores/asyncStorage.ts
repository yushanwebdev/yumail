import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

export const asyncStorage: StateStorage = {
  getItem: async (name) => {
    return (await AsyncStorage.getItem(name)) ?? null;
  },
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};
