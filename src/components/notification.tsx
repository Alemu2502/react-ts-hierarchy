import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert } from '@mantine/core';
import { RootState } from './ui/store.tsx';
import { setNotification } from './ui/hierarchySlice.tsx';
import { Notification } from '../types.ts'; 

// Constant for auto-dismiss timeout
const DISMISS_TIMEOUT = 3000;

export const NotificationComponent = (): JSX.Element | null => {
  // Get the notification state from Redux and ensure it's never undefined
  const notification: Notification | null = useSelector(
    (state: RootState) => state.hierarchy.notification
  ) ?? null; 

  const dispatch = useDispatch();

  // UseRef to track timeout and prevent multiple timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (notification) {
      // Clear any existing timer before setting a new one
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        dispatch(setNotification(null)); // Clears the notification after timeout
      }, DISMISS_TIMEOUT);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current); // Cleanup on unmount
    };
  }, [notification, dispatch]);

  // If there's no notification, do not render anything
  if (!notification) return null;

  return (
    <Alert
      title={
        notification.type === 'success'
          ? 'Success'   : 'Error'
      } // Dynamically setting the alert title based on type
      color={
        notification.type === 'success'
          ? 'green' : 'red'
      } // Setting alert color based on type
      withCloseButton
      onClose={() => dispatch(setNotification(null))} // Manual dismissal
      className="absolute top-5 left-0 z-[1000] sm:w-[calc(100%-1000px)]"
    >
      {notification.message} {/* Display notification message */}
    </Alert>
  );
};
