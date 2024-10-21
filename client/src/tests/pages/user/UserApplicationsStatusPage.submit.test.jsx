import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import UserApplicationsStatusPage from '../../../pages/user/UserApplicationsStatusPage';
import { useUserApplications } from '../../../pages/user/hooks/useUserApplications';
import * as sonner from 'sonner';

vi.mock('../../../pages/user/hooks/useUserApplications', () => ({
  useUserApplications: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('UserApplicationsStatusPage - Submit Functionality', () => {
  const mockApplications = [
    {
      id: '1',
      applicationNumber: 'APP-001',
      applicationType: 'Test Type',
      status: 'Draft',
      dateOfSubmission: '1634567890000',
    },
  ];

  const mockSubmitPermit = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    useUserApplications.mockReturnValue({
      applications: mockApplications,
      loading: false,
      error: null,
      refetch: mockRefetch,
      submitPermit: mockSubmitPermit,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the submit button for draft applications', () => {
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-001').closest('tr');
    const submitButton = within(draftRow).getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('opens the submit confirmation dialog when submit button is clicked', async () => {
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-001').closest('tr');
    const submitButton = within(draftRow).getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to submit this application?/i)).toBeInTheDocument();
    });
  });

  it('calls submitPermit when confirmation is accepted', async () => {
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-001').closest('tr');
    const submitButton = within(draftRow).getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    const confirmButton = await screen.findByRole('button', { name: /submit/i, within: screen.getByRole('alertdialog') });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSubmitPermit).toHaveBeenCalledWith('1');
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('shows success toast when submit is successful', async () => {
    mockSubmitPermit.mockResolvedValue({});
    render(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-001').closest('tr');
    const submitButton = within(draftRow).getByRole('button', { name: /submit/i });
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
    const draftRow = screen.getByText('APP-001').closest('tr');
    const submitButton = within(draftRow).getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    const confirmButton = await screen.findByRole('button', { name: /submit/i, within: screen.getByRole('alertdialog') });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith('Error submitting application: Submit failed');
    });

    consoleErrorSpy.mockRestore();
  });
});
