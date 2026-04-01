import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccountSettingField } from './AccountSettingField';

describe('AccountSettingField', () => {
  it('renders label and value with optional test ids', () => {
    render(
      <AccountSettingField
        rootTestId="account-setting-field"
        valueTestId="account-setting-field-value"
        label="Field label"
        value="Field value"
      />
    );

    expect(screen.getByTestId('account-setting-field')).toBeInTheDocument();
    expect(screen.getByText('Field label')).toBeInTheDocument();
    expect(screen.getByTestId('account-setting-field-value')).toHaveTextContent('Field value');
  });
});
