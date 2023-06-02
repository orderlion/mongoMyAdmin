'use client';

import React, { useState } from 'react';

const paginationStyle = {
  backgroundColor: 'white',
  position: 'fixed',
  bottom: 0,
  padding: 16,
  left: 'var(--mantine-navbar-width, 0px)',
  right: 0,
  borderTop: '0.0625rem solid #e9ecef'
};


export default function PaginationContainer({ children }) {
  return (
    <div style={paginationStyle}>
      {children}
    </div>
  )
}
