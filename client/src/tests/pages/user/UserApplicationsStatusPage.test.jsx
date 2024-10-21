import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, expect } from 'vitest';
import UserApplicationsStatusPage from '../../../pages/user/UserApplicationsStatusPage';
import { useUserApplications } from '../../../pages/user/hooks/useUserApplications';
import * as sonner from 'sonner';

// Mock the useUserApplications hook
vi.mock('../../../pages/user/hooks/useUserApplications', () => ({
  useUserApplications: vi.fn(),
}));

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('UserApplicationsStatusPage', () => {
  const mockApplications = [
    {
      id: '1',
      applicationNumber: 'APP-001',
      applicationType: 'Test Type',
      status: 'Submitted',
      dateOfSubmission: '1634567890000',
    },
  ];

  const mockUnsubmitPermit = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    useUserApplications.mockReturnValue({
      applications: mockApplications,
      loading: false,
      error: null,
      refetch: mockRefetch,
      unsubmitPermit: mockUnsubmitPermit,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the unsubmit button for submitted applications', () => {
    render(<UserApplicationsStatusPage />);
    expect(screen.getByRole('button', { name: /unsubmit/i })).toBeInTheDocument();
  });

  it('opens the unsubmit confirmation dialog when unsubmit button is clicked', async () => {
    render(<UserApplicationsStatusPage />);
    const unsubmitButton = screen.getByRole('button', { name: /unsubmit/i });
    fireEvent.click(unsubmitButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to unsubmit this application?/i)).toBeInTheDocument();
    });
  });

  it('calls unsubmitPermit when confirmation is accepted', async () => {
    render(<UserApplicationsStatusPage />);
    const unsubmitButton = screen.getByRole('button', { name: /unsubmit/i });
    fireEvent.click(unsubmitButton);

    const confirmButton = await screen.findByRole('button', { name: /unsubmit/i, within: screen.getByRole('alertdialog') });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockUnsubmitPermit).toHaveBeenCalledWith('1');
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('shows success toast when unsubmit is successful', async () => {
    mockUnsubmitPermit.mockResolvedValue({});
    render(<UserApplicationsStatusPage />);
    const unsubmitButton = screen.getByRole('button', { name: /unsubmit/i });
    fireEvent.click(unsubmitButton);

    const confirmButton = await screen.findByRole('button', { name: /unsubmit/i, within: screen.getByRole('alertdialog') });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(sonner.toast.success).toHaveBeenCalledWith('Application unsubmitted successfully');
    });
  });

  it('shows error toast when unsubmit fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUnsubmitPermit.mockRejectedValue(new Error('Unsubmit failed'));
    render(<UserApplicationsStatusPage />);
    const unsubmitButton = screen.getByRole('button', { name: /unsubmit/i });
    fireEvent.click(unsubmitButton);

    const confirmButton = await screen.findByRole('button', { name: /unsubmit/i, within: screen.getByRole('alertdialog') });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith('Error unsubmitting application: Unsubmit failed');
    });

    consoleErrorSpy.mockRestore();
  });
});
