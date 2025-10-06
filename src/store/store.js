import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Make store globally available for service layer access
if (typeof window !== 'undefined') {
  window.__REDUX_STORE__ = store;
}

export default store;