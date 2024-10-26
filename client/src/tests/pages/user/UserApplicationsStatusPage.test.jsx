import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
    {
      id: '2',
      applicationNumber: 'APP-002',
      applicationType: 'Test Type',
      status: 'Draft',
      dateOfSubmission: '1634567890000',
    },
  ];

  const mockUnsubmitPermit = vi.fn();
  const mockSubmitPermit = vi.fn();
  const mockRefetch = vi.fn();
  const mockFetchUserApplications = vi.fn();

  beforeEach(() => {
    useUserApplications.mockReturnValue({
      applications: mockApplications,
      loading: false,
      error: null,
      refetch: mockRefetch,
      unsubmitPermit: mockUnsubmitPermit,
      submitPermit: mockSubmitPermit,
      fetchUserApplications: mockFetchUserApplications,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the unsubmit button for submitted applications', () => {
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-001').closest('tr');
    const unsubmitButton = within(draftRow).getByTestId('unsubmit-button');
    expect(unsubmitButton).toBeInTheDocument();
  });

  it('opens the unsubmit confirmation dialog when unsubmit button is clicked', async () => {
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-001').closest('tr');
    const unsubmitButton = within(draftRow).getByTestId('unsubmit-button');
    fireEvent.click(unsubmitButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to unsubmit this application?/i)).toBeInTheDocument();
    });
  });

  it('calls unsubmitPermit when confirmation is accepted', async () => {
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-001').closest('tr');
    const unsubmitButton = within(draftRow).getByTestId('unsubmit-button');
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
    const draftRow = screen.getByText('APP-001').closest('tr');
    const unsubmitButton = within(draftRow).getByTestId('unsubmit-button');
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
    const draftRow = screen.getByText('APP-001').closest('tr');
    const unsubmitButton = within(draftRow).getByTestId('unsubmit-button');
    fireEvent.click(unsubmitButton);

    const confirmButton = await screen.findByRole('button', { name: /unsubmit/i, within: screen.getByRole('alertdialog') });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith('Error unsubmitting application: Unsubmit failed');
    });

    consoleErrorSpy.mockRestore();
  });

  it('renders the submit button for draft applications', () => {
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-002').closest('tr');
    const submitButton = within(draftRow).getByTestId('submit-button');
    expect(submitButton).toBeInTheDocument();
  });

  it('opens the submit confirmation dialog when submit button is clicked', async () => {
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-002').closest('tr');
    const submitButton = within(draftRow).getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to submit this application?/i)).toBeInTheDocument();
    });
  });

  it('calls submitPermit when confirmation is accepted', async () => {
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-002').closest('tr');
    const submitButton = within(draftRow).getByTestId('submit-button');
    fireEvent.click(submitButton);

    const confirmButton = await screen.findByRole('button', { name: /submit/i, within: screen.getByRole('alertdialog') });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSubmitPermit).toHaveBeenCalledWith('2');
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('shows success toast when submit is successful', async () => {
    mockSubmitPermit.mockResolvedValue({});
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-002').closest('tr');
    const submitButton = within(draftRow).getByTestId('submit-button');
    fireEvent.click(submitButton);

    const confirmButton = await screen.findByRole('button', { name: /submit/i, within: screen.getByRole('alertdialog') });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(sonner.toast.success).toHaveBeenCalledWith('Application submitted successfully');
    });
  });

  it('shows error toast when submit fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSubmitPermit.mockRejectedValue(new Error('Submit failed'));
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-002').closest('tr');
    const submitButton = within(draftRow).getByTestId('submit-button');
    fireEvent.click(submitButton);

    const confirmButton = await screen.findByRole('button', { name: /submit/i, within: screen.getByRole('alertdialog') });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith('Error submitting application: Submit failed');
    });

    consoleErrorSpy.mockRestore();
  });
});
