import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import UserApplicationsStatusPage from '@/pages/user/UserApplicationsStatusPage';
import { vi } from 'vitest';
import { toast } from 'sonner';
import { MemoryRouter } from 'react-router-dom';

// Mock the hooks
vi.mock('@/pages/user/hooks/useUserApplications', () => ({
  useUserApplications: vi.fn()
}));

vi.mock('@/pages/user/hooks/useUserOrderOfPayments', () => ({
  useUserOrderOfPayments: vi.fn().mockReturnValue({
    oops: [],
    loading: false,
    error: null
  })
}));

// Import the hook after mocking
import { useUserApplications } from '@/pages/user/hooks/useUserApplications';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockApplications = [
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

describe('UserApplicationsStatusPage - Submit Functionality', () => {
  const mockSubmitPermit = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useUserApplications.mockReturnValue({
      applications: mockApplications,
      loading: false,
      error: null,
      refetch: mockRefetch,
      submitPermit: mockSubmitPermit,
      fetchUserApplications: vi.fn()
    });
  });

  it('submits application successfully', async () => {
    mockSubmitPermit.mockResolvedValue({});
    renderWithProviders(<UserApplicationsStatusPage />);

    const draftRow = screen.getByText('APP-002').closest('tr');
    const submitButton = within(draftRow).getByTestId('submit-button');
    fireEvent.click(submitButton);

    const confirmButton = await screen.findByRole('button', { name: /submit/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSubmitPermit).toHaveBeenCalledWith('2');
      expect(toast.success).toHaveBeenCalledWith('Application submitted successfully');
    });
  });
});
