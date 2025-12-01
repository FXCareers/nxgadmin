import { configureStore } from '@reduxjs/toolkit';
import authReducer, { initializeAuth } from './slices/authSlice';
import blogReducer from './slices/blogSlice';
import userReducer from './slices/userSlice';
import careerReducer from './slices/careerSlice';
import awardReducer from './slices/awardSlice';
import seoReducer from './slices/seoSlice';
import themeReducer from './slices/themeSlice';
import contactReducer from './slices/contactSlice';
import applicationReducer from './slices/applicationSlice';
import subscriberReducer from './slices/subscriberSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    blog: blogReducer,
    user: userReducer,
    career: careerReducer,
    award: awardReducer,
    seo: seoReducer,
    theme: themeReducer,
    contact: contactReducer,
    application: applicationReducer,
    subscriber: subscriberReducer,
  },
});

// Initialize auth state on store creation
if (typeof window !== 'undefined') {
  store.dispatch(initializeAuth());
}

export default store;
