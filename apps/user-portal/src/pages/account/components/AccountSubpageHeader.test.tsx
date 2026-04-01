import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccountSubpageHeader } from './AccountSubpageHeader';

describe('AccountSubpageHeader', () => {
  it('renders title and description with stable test ids', () => {
    render(
      <AccountSubpageHeader
        testIdPrefix="account-settings-example"
        title="Example title"
        description="Example description"
      />
    );

    expect(screen.getByTestId('account-settings-example-title')).toHaveTextContent('Example title');
    expect(screen.getByTestId('account-settings-example-description')).toHaveTextContent(
      'Example description'
    );
  });
});
