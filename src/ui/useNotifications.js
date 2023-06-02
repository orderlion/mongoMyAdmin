'use client';

import React from 'react';
import { Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconExclamationCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function useNotifications() {
  return ({
    success: (text, options = {}) => notifications.show({
      message: text,
      autoClose: 3000,
      color: 'green',
      icon: (
        <ThemeIcon color="teal" radius="xl">
          <IconCheck size={18} />
        </ThemeIcon>
      ),
      ...options
    }),
    error: (text, options = {}) => notifications.show({
      message: text,
      autoClose: 3000,
      color: 'red',
      icon: (
        <ThemeIcon color="red" radius="xl">
          <IconExclamationCircle size={18} />
        </ThemeIcon>
      ),
      ...options
    }),
  })
}
