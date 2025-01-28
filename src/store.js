import { configureStore } from '@reduxjs/toolkit';
import phonebookReducer from './features/phonebookSlice';

export const store = configureStore({
  reducer: {
    phonebook: phonebookReducer,
  },
});
