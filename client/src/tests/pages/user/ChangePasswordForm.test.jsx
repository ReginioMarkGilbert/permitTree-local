import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import { toast } from 'sonner';
import { gql } from '@apollo/client';
import ChangePasswordForm from '../../../pages/user/components/ChangePasswordForm';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

describe('ChangePasswordForm', () => {
  const mockOnClose = vi.fn();

  const successMock = {
    request: {
      query: CHANGE_PASSWORD,
      variables: {
        input: {
          currentPassword: 'OldPass123',
          newPassword: 'NewPass123',
          confirmPassword: 'NewPass123'
        }
      }
    },
    result: {
      data: {
        changePassword: true
      }
    }
  };

  const errorMock = {
    request: {
      query: CHANGE_PASSWORD,
      variables: {
        input: {
          currentPassword: 'WrongPass123',
          newPassword: 'NewPass123',
          confirmPassword: 'NewPass123'
        }
      }
    },
    error: new Error('Current password is incorrect')
  };

  const renderForm = (mocks = []) => {
    return render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChangePasswordForm onClose={mockOnClose} />
      </MockedProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password form fields', () => {
    renderForm();
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('validates password requirements', async () => {
    renderForm();
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const form = screen.getByTestId('password-form');

    // Test weak password
    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('New password must be at least 8 characters long');
    });
  });

  it('validates password match', async () => {
    renderForm();
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const form = screen.getByTestId('password-form');

    fireEvent.change(newPasswordInput, { target: { value: 'NewPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('New password and confirm password do not match');
    });
  });

  it('successfully changes password', async () => {
    renderForm([successMock]);

    fireEvent.change(screen.getByLabelText(/^current password$/i), {
      target: { value: 'OldPass123' }
    });
    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: 'NewPass123' }
    });
    fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
      target: { value: 'NewPass123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Password changed successfully');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles incorrect current password', async () => {
    renderForm([errorMock]);

    fireEvent.change(screen.getByLabelText(/^current password$/i), {
      target: { value: 'WrongPass123' }
    });
    fireEvent.change(screen.getByLabelText(/^new password$/i), {
      target: { value: 'NewPass123' }
    });
    fireEvent.change(screen.getByLabelText(/^confirm new password$/i), {
      target: { value: 'NewPass123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Current password is incorrect');
    });
  });

  it('shows password requirements when focused', () => {
    renderForm();
    const newPasswordInput = screen.getByLabelText('New Password');

    fireEvent.focus(newPasswordInput);

    const requirements = screen.getByTestId('password-requirements');
    expect(requirements).toBeInTheDocument();
    expect(requirements).toHaveTextContent('New password must:');
    expect(requirements).toHaveTextContent('Be at least 8 characters long');
    expect(requirements).toHaveTextContent('Include at least one uppercase letter');
    expect(requirements).toHaveTextContent('Include at least one number');
  });

  it('disables submit button when fields are empty', () => {
    renderForm();
    const submitButton = screen.getByRole('button', { name: /change password/i });
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('shows real-time password validation feedback', () => {
    renderForm();
    const newPasswordInput = screen.getByLabelText('New Password');

    // Focus to show requirements
    fireEvent.focus(newPasswordInput);

    // Initially all requirements should be red
    const requirements = screen.getByTestId('password-requirements');
    expect(requirements).toBeInTheDocument();

    // Test length requirement
    fireEvent.change(newPasswordInput, { target: { value: '12345678' } });
    expect(screen.getByText('Be at least 8 characters long')).toHaveClass('text-green-600');

    // Test uppercase requirement
    fireEvent.change(newPasswordInput, { target: { value: '12345678A' } });
    expect(screen.getByText('Include at least one uppercase letter')).toHaveClass('text-green-600');

    // Test removing requirements
    fireEvent.change(newPasswordInput, { target: { value: '123' } });
    expect(screen.getByText('Be at least 8 characters long')).not.toHaveClass('text-green-600');
    expect(screen.getByText('Include at least one uppercase letter')).not.toHaveClass('text-green-600');
  });
});
