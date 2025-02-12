import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from './store.tsx'; 
import { generateUniqueIntId } from '../../firebase.ts'; 

interface LastNodeIdState {
  lastNodeId: number;
}

const initialState: LastNodeIdState = {
  lastNodeId: 0,
};

// Create a slice for the lastNodeId state
const lastNodeIdSlice = createSlice({
  name: 'lastNodeId',
  initialState,
  reducers: {
    setLastNodeId(state, action: PayloadAction<number>) {
      state.lastNodeId = action.payload;
    },
    incrementLastNodeId(state) {
      state.lastNodeId += 1;
    },
  },
});

export const { setLastNodeId, incrementLastNodeId } = lastNodeIdSlice.actions;

// Fetch the last node ID from Firebase and dispatch it to Redux
export const fetchLastNodeId = () => async (dispatch: AppDispatch) => {
  try {
    const lastNodeId = await generateUniqueIntId(); 
    dispatch(setLastNodeId(lastNodeId)); 
  } catch (error) {
    console.error('Error fetching last node ID:', error);
    // Default if no value exists or error occurs
    dispatch(setLastNodeId(0)); 
  }
};

// Increment the last node ID and save it to Firebase atomically
export const incrementAndSaveLastNodeId = () => async (dispatch: AppDispatch) => {
  try {
    const newNodeId = await generateUniqueIntId();
    dispatch(setLastNodeId(newNodeId));
  } catch (error) {
    console.error('Error generating unique node ID:', error);
  }
};

export default lastNodeIdSlice.reducer;
