import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import UserApplicationsStatusPage from '../../../pages/user/UserApplicationsStatusPage';
import { vi } from 'vitest';
import { toast } from 'sonner';
import { MemoryRouter } from 'react-router-dom';
import { useUserApplications } from '../../../pages/user/hooks/useUserApplications';
import { useUserOrderOfPayments } from '../../../pages/user/hooks/useUserOrderOfPayments';

// Mock the hooks
vi.mock('../../../pages/user/hooks/useUserApplications');
vi.mock('../../../pages/user/hooks/useUserOrderOfPayments');
vi.mock('sonner');

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

describe('UserApplicationsStatusPage', () => {
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

    useUserOrderOfPayments.mockReturnValue({
      oops: [],
      loading: false,
      error: null,
      refetch: vi.fn()
    });
  });

  const renderPage = () => {
    return render(
      <MemoryRouter>
        <MockedProvider mocks={[]} addTypename={false}>
          <UserApplicationsStatusPage />
        </MockedProvider>
      </MemoryRouter>
    );
  };

  it('renders the unsubmit button for submitted applications', () => {
    renderPage();
    const submittedRow = screen.getByText('APP-001').closest('tr');
    expect(within(submittedRow).getByTestId('unsubmit-button')).toBeInTheDocument();
  });

  it('opens the unsubmit confirmation dialog when unsubmit button is clicked', async () => {
    renderPage();
    const submittedRow = screen.getByText('APP-001').closest('tr');
    fireEvent.click(within(submittedRow).getByTestId('unsubmit-button'));

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to unsubmit this application?/i)).toBeInTheDocument();
    });
  });

  it('calls unsubmitPermit when confirmation is accepted', async () => {
    renderPage();
    const submittedRow = screen.getByText('APP-001').closest('tr');
    fireEvent.click(within(submittedRow).getByTestId('unsubmit-button'));

    const confirmButton = await screen.findByRole('button', { name: /unsubmit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockUnsubmitPermit).toHaveBeenCalledWith('1');
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('shows success toast when unsubmit is successful', async () => {
    mockUnsubmitPermit.mockResolvedValue({});
    renderPage();
    const submittedRow = screen.getByText('APP-001').closest('tr');
    fireEvent.click(within(submittedRow).getByTestId('unsubmit-button'));

    const confirmButton = await screen.findByRole('button', { name: /unsubmit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application unsubmitted successfully');
    });
  });

  it('shows error toast when unsubmit fails', async () => {
    mockUnsubmitPermit.mockRejectedValue(new Error('Unsubmit failed'));
    renderPage();
    const submittedRow = screen.getByText('APP-001').closest('tr');
    fireEvent.click(within(submittedRow).getByTestId('unsubmit-button'));

    const confirmButton = await screen.findByRole('button', { name: /unsubmit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error unsubmitting application: Unsubmit failed');
    });
  });

  it('renders the submit button for draft applications', async () => {
    renderPage();
    const draftRow = screen.getByText('APP-002').closest('tr');
    expect(within(draftRow).getByTestId('submit-button')).toBeInTheDocument();
  });

  it('opens the submit confirmation dialog when submit button is clicked', async () => {
    renderPage();
    const draftRow = screen.getByText('APP-002').closest('tr');
    fireEvent.click(within(draftRow).getByTestId('submit-button'));

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to submit this application?/i)).toBeInTheDocument();
    });
  });

  it('calls submitPermit when confirmation is accepted', async () => {
    renderPage();
    const draftRow = screen.getByText('APP-002').closest('tr');
    fireEvent.click(within(draftRow).getByTestId('submit-button'));

    const confirmButton = await screen.findByRole('button', { name: /submit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSubmitPermit).toHaveBeenCalledWith('2');
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('shows success toast when submit is successful', async () => {
    mockSubmitPermit.mockResolvedValue({});
    renderPage();
    const draftRow = screen.getByText('APP-002').closest('tr');
    fireEvent.click(within(draftRow).getByTestId('submit-button'));

    const confirmButton = await screen.findByRole('button', { name: /submit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application submitted successfully');
    });
  });

  it('shows error toast when submit fails', async () => {
    mockSubmitPermit.mockRejectedValue(new Error('Submit failed'));
    renderPage();
    const draftRow = screen.getByText('APP-002').closest('tr');
    fireEvent.click(within(draftRow).getByTestId('submit-button'));

    const confirmButton = await screen.findByRole('button', { name: /submit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error submitting application: Submit failed');
    });
  });
});
