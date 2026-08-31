import { configureStore } from '@reduxjs/toolkit';
import authReducer, { initializeAuth } from './slices/authSlice';
import blogReducer from './slices/blogSlice';
import userReducer from './slices/userSlice';
import careerReducer from './slices/careerSlice';
import awardReducer from './slices/awardSlice';
import seoReducer from './slices/seoSlice';
import faqReducer from './slices/faqSlice';
import themeReducer from './slices/themeSlice';
import contactReducer from './slices/contactSlice';
import applicationReducer from './slices/applicationSlice';
import subscriberReducer from './slices/subscriberSlice';
import leadReducer from './slices/leadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    blog: blogReducer,
    user: userReducer,
    career: careerReducer,
    award: awardReducer,
    seo: seoReducer,
    faq: faqReducer,
    theme: themeReducer,
    contact: contactReducer,
    application: applicationReducer,
    subscriber: subscriberReducer,
    lead: leadReducer,
  },
});

// Initialize auth state on store creation
if (typeof window !== 'undefined') {
  store.dispatch(initializeAuth());
}

export default store;
