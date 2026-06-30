'use client';

import { Provider, useDispatch } from 'react-redux';
import { store } from '@/store';
import { useEffect } from 'react';
import { initializeAuth } from '@/store/slices/authSlice';

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AppInitializer>
        {children}
      </AppInitializer>
    </Provider>
  );
}