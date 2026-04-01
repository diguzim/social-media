import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AccountSettingsLayout } from './AccountSettingsLayout';

describe('AccountSettingsLayout', () => {
  it('renders vertical navigation and nested content', () => {
    render(
      <MemoryRouter initialEntries={['/account/personal-data']}>
        <Routes>
          <Route path="/account" element={<AccountSettingsLayout />}>
            <Route path="personal-data" element={<div data-testid="account-personal-content" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('account-settings-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('account-settings-nav-personal-data')).toBeInTheDocument();
    expect(screen.getByTestId('account-settings-nav-privacy')).toBeInTheDocument();
    expect(screen.getByTestId('account-personal-content')).toBeInTheDocument();
  });
});
