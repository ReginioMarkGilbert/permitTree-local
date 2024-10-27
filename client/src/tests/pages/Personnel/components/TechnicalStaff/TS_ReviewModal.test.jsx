import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import { toast } from 'sonner';
import { gql } from '@apollo/client';
import TS_ReviewModal from '../../../../../pages/Personnel/components/PersonnelDashboardComponents/TechnicalStaff/TS_ReviewModal';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Update the UPDATE_PERMIT_STAGE mutation
const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $acceptedByTechnicalStaff: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff
    ) {
      id
      currentStage
      status
      acceptedByTechnicalStaff
      history {
        notes
        timestamp
      }
    }
  }
`;

describe('TS_ReviewModal', () => {
  const mockApplication = {
    id: '1',
    applicationNumber: 'APP-001',
    status: 'Submitted',
    currentStage: 'Submitted'
  };

  const mockOnClose = vi.fn();
  const mockOnReviewComplete = vi.fn();

  const successMock = {
    request: {
      query: UPDATE_PERMIT_STAGE,
      variables: {
        id: '1',
        currentStage: 'ReturnedByTechnicalStaff',
        status: 'Returned',
        notes: 'Missing documents',
        acceptedByTechnicalStaff: false
      }
    },
    result: {
      data: {
        updatePermitStage: {
          id: '1',
          currentStage: 'ReturnedByTechnicalStaff',
          status: 'Returned',
          acceptedByTechnicalStaff: false,
          history: [
            {
              notes: 'Missing documents',
              timestamp: new Date().toISOString()
            }
          ]
        }
      }
    }
  };

  const errorMock = {
    request: {
      query: UPDATE_PERMIT_STAGE,
      variables: {
        id: '1',
        currentStage: 'ReturnedByTechnicalStaff',
        status: 'Returned',
        notes: 'Missing documents',
        acceptedByTechnicalStaff: false
      }
    },
    error: new Error('Failed to update permit stage')
  };

  // Add a new mock for the accept action
  const acceptSuccessMock = {
    request: {
      query: UPDATE_PERMIT_STAGE,
      variables: {
        id: '1',
        currentStage: 'ForRecordByReceivingClerk',
        status: 'In Progress',
        notes: 'Application accepted by Technical Staff',
        acceptedByTechnicalStaff: true
      }
    },
    result: {
      data: {
        updatePermitStage: {
          id: '1',
          currentStage: 'ForRecordByReceivingClerk',
          status: 'In Progress',
          acceptedByTechnicalStaff: true,
          history: [
            {
              notes: 'Application accepted by Technical Staff',
              timestamp: new Date().toISOString()
            }
          ]
        }
      }
    }
  };

  const renderModal = (mocks = []) => {
    return render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TS_ReviewModal
          isOpen={true}
          onClose={mockOnClose}
          application={mockApplication}
          onReviewComplete={mockOnReviewComplete}
        />
      </MockedProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal with application details', () => {
    renderModal();
    expect(screen.getByText(`Application Number: ${mockApplication.applicationNumber}`)).toBeInTheDocument();
    expect(screen.getByTestId('accept-button')).toBeInTheDocument();
    expect(screen.getByTestId('return-button')).toBeInTheDocument();
  });

  it('shows remarks textarea when clicking Return button', () => {
    renderModal();
    fireEvent.click(screen.getByTestId('return-button'));
    expect(screen.getByTestId('return-remarks')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-return')).toBeInTheDocument();
  });

  it('requires remarks when returning application', async () => {
    renderModal();
    fireEvent.click(screen.getByTestId('return-button'));
    fireEvent.click(screen.getByTestId('confirm-return'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please provide remarks for returning the application.');
    });
  });

  it('successfully returns application with remarks', async () => {
    renderModal([successMock]);

    fireEvent.click(screen.getByTestId('return-button'));
    fireEvent.change(screen.getByTestId('return-remarks'), {
      target: { value: 'Missing documents' }
    });

    fireEvent.click(screen.getByTestId('confirm-return'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application returned successfully');
      expect(mockOnReviewComplete).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('handles error when returning application', async () => {
    renderModal([errorMock]);

    fireEvent.click(screen.getByTestId('return-button'));
    fireEvent.change(screen.getByTestId('return-remarks'), {
      target: { value: 'Missing documents' }
    });

    fireEvent.click(screen.getByTestId('confirm-return'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error returning application: Failed to update permit stage');
    }, { timeout: 2000 });
  });

  it('allows canceling the return process', () => {
    renderModal();
    fireEvent.click(screen.getByTestId('return-button'));
    fireEvent.click(screen.getByTestId('cancel-return'));

    // Should show initial buttons again
    expect(screen.getByTestId('accept-button')).toBeInTheDocument();
    expect(screen.getByTestId('return-button')).toBeInTheDocument();
  });

  it('successfully accepts application', async () => {
    renderModal([acceptSuccessMock]);

    fireEvent.click(screen.getByTestId('accept-button'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application accepted successfully');
      expect(mockOnReviewComplete).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
