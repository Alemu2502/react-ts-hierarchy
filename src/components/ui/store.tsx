import { configureStore } from '@reduxjs/toolkit';
import hierarchyReducer from './hierarchySlice.tsx';
import lastNodeIdReducer from './lastNodeIdSlice.tsx';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    hierarchy: hierarchyReducer, 
    lastNodeId: lastNodeIdReducer,
  },
});

// Define RootState for use in selectors and throughout the application
export type RootState = ReturnType<typeof store.getState>;

 // Define AppDispatch for typing the dispatch function
export type AppDispatch = typeof store.dispatch;
