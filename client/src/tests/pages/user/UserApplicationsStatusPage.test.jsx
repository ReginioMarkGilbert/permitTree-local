import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import UserApplicationsStatusPage from '../../../pages/user/UserApplicationsStatusPage';
import { vi } from 'vitest';
import { toast } from 'sonner';
import { MemoryRouter } from 'react-router-dom';

// Mock the hooks
vi.mock('../../../pages/user/hooks/useUserApplications', () => ({
  useUserApplications: vi.fn()
}));

vi.mock('../../../pages/user/hooks/useUserOrderOfPayments', () => ({
  useUserOrderOfPayments: vi.fn().mockReturnValue({
    oops: [],
    loading: false,
    error: null
  })
}));

// Import the hook after mocking
import { useUserApplications } from '../../../pages/user/hooks/useUserApplications';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockApplications = [
  {
    id: '1',
    applicationNumber: 'APP-001',
    applicationType: 'Test Type',
    status: 'Submitted',
    currentStage: 'Submitted',
    dateOfSubmission: '1634567890000',
  },
  {
    id: '2',
    applicationNumber: 'APP-002',
    applicationType: 'Test Type',
    status: 'Draft',
    currentStage: 'Draft',
    dateOfSubmission: '1634567890000',
  }
];

const renderWithProviders = (ui) => {
  return render(
    <MemoryRouter>
      <MockedProvider mocks={[]} addTypename={false}>
        {ui}
      </MockedProvider>
    </MemoryRouter>
  );
};

describe('UserApplicationsStatusPage', () => {
  // Define mock functions
  const mockUnsubmitPermit = vi.fn();
  const mockSubmitPermit = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useUserApplications.mockReturnValue({
      applications: mockApplications,
      loading: false,
      error: null,
      refetch: mockRefetch,
      unsubmitPermit: mockUnsubmitPermit,
      submitPermit: mockSubmitPermit,
      fetchUserApplications: vi.fn()
    });
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
    renderWithProviders(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-001').closest('tr');
    const unsubmitButton = within(draftRow).getByTestId('unsubmit-button');
    fireEvent.click(unsubmitButton);

    const confirmButton = await screen.findByRole('button', { name: /unsubmit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockUnsubmitPermit).toHaveBeenCalledWith('1');
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('shows success toast when unsubmit is successful', async () => {
    mockUnsubmitPermit.mockResolvedValue({});
    renderWithProviders(<UserApplicationsStatusPage />);
    const draftRow = screen.getByText('APP-001').closest('tr');
    const unsubmitButton = within(draftRow).getByTestId('unsubmit-button');
    fireEvent.click(unsubmitButton);

    const confirmButton = await screen.findByRole('button', { name: /unsubmit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application unsubmitted successfully');
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
      expect(toast.error).toHaveBeenCalledWith('Error unsubmitting application: Unsubmit failed');
    });

    consoleErrorSpy.mockRestore();
  });

  it('renders the submit button for draft applications', async () => {
    renderWithProviders(<UserApplicationsStatusPage />);

    await waitFor(() => {
      const draftRow = screen.getByText('APP-002').closest('tr');
      expect(within(draftRow).getByTestId('submit-button')).toBeInTheDocument();
    });
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
      expect(toast.success).toHaveBeenCalledWith('Application submitted successfully');
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
      expect(toast.error).toHaveBeenCalledWith('Error submitting application: Submit failed');
    });

    consoleErrorSpy.mockRestore();
  });
});
