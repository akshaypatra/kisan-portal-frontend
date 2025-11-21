import { configureStore } from '@reduxjs/toolkit';
import reducer from './mandiSlice';

export const store = configureStore({
  reducer: {
    mandi: reducer,
  },
});

export default store;
