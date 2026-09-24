import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';

test('AuthProvider renders children', () => {
  render(
    <AuthProvider>
      <div data-testid="child">Test Child</div>
    </AuthProvider>
  );
  expect(screen.getByTestId('child')).toBeInTheDocument();
});
