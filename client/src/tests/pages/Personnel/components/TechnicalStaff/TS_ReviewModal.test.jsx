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
    $acceptedByTechnicalStaff: Boolean,
    $approvedByTechnicalStaff: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      acceptedByTechnicalStaff: $acceptedByTechnicalStaff,
      approvedByTechnicalStaff: $approvedByTechnicalStaff
    ) {
      id
      currentStage
      status
      acceptedByTechnicalStaff
      approvedByTechnicalStaff
      history {
        notes
        timestamp
      }
    }
  }
`;

// Define defaultProps before renderModal
const mockApplication = {
  id: '1',
  applicationNumber: 'APP-001',
  status: 'Submitted',
  currentStage: 'Submitted'
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  application: mockApplication,
  onReviewComplete: vi.fn()
};

// Define renderModal function
const renderModal = (mocks = []) => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <TS_ReviewModal {...defaultProps} />
    </MockedProvider>
  );
};

describe('TS_ReviewModal', () => {
  const mockSuccessfulReturn = {
    request: {
      query: UPDATE_PERMIT_STAGE,
      variables: {
        id: "1",
        currentStage: "ReturnedByTechnicalStaff",
        status: "Returned",
        notes: "Missing documents",
        acceptedByTechnicalStaff: false
      }
    },
    result: {
      data: {
        updatePermitStage: {
          id: "1",
          currentStage: "ReturnedByTechnicalStaff",
          status: "Returned",
          acceptedByTechnicalStaff: false,
          approvedByTechnicalStaff: false,
          history: [
            {
              notes: "Missing documents",
              timestamp: "2023-01-01T00:00:00Z"
            }
          ]
        }
      }
    }
  }

  const mockErrorReturn = {
    request: {
      query: UPDATE_PERMIT_STAGE,
      variables: {
        id: "1",
        currentStage: "ReturnedByTechnicalStaff",
        status: "Returned",
        notes: "Missing documents",
        acceptedByTechnicalStaff: false
      }
    },
    error: new Error('Failed to update permit stage')
  }

  const mockSuccessfulAccept = {
    request: {
      query: UPDATE_PERMIT_STAGE,
      variables: {
        id: "1",
        currentStage: "ForRecordByReceivingClerk",
        status: "In Progress",
        notes: "Application accepted by Technical Staff",
        acceptedByTechnicalStaff: true
      }
    },
    result: {
      data: {
        updatePermitStage: {
          id: "1",
          currentStage: "ForRecordByReceivingClerk",
          status: "In Progress",
          acceptedByTechnicalStaff: true,
          approvedByTechnicalStaff: false,
          history: [
            {
              notes: "Application accepted by Technical Staff",
              timestamp: "2023-01-01T00:00:00Z"
            }
          ]
        }
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal with application details', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <TS_ReviewModal {...defaultProps} />
      </MockedProvider>
    );
    expect(screen.getByText(`Application Number: ${mockApplication.applicationNumber}`)).toBeInTheDocument();
    expect(screen.getByTestId('accept-button')).toBeInTheDocument();
    expect(screen.getByTestId('return-button')).toBeInTheDocument();
  });

  it('shows remarks textarea when clicking Return button', () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <TS_ReviewModal {...defaultProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('return-button'));
    expect(screen.getByTestId('return-remarks')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-return')).toBeInTheDocument();
  });

  it('requires remarks when returning application', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <TS_ReviewModal {...defaultProps} />
      </MockedProvider>
    );
    fireEvent.click(screen.getByTestId('return-button'));
    fireEvent.click(screen.getByTestId('confirm-return'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please provide remarks for returning the application.');
    });
  });

  it('successfully returns application with remarks', async () => {
    renderModal([mockSuccessfulReturn]);

    fireEvent.click(screen.getByTestId('return-button'));
    fireEvent.change(screen.getByTestId('return-remarks'), {
      target: { value: 'Missing documents' }
    });

    fireEvent.click(screen.getByTestId('confirm-return'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application returned successfully');
      expect(defaultProps.onReviewComplete).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('handles error when returning application', async () => {
    // Fix the syntax of the mock object
    renderModal([{
      request: {
        query: UPDATE_PERMIT_STAGE,
        variables: {
          id: "1",
          currentStage: "ReturnedByTechnicalStaff",
          status: "Returned",
          notes: "Missing documents",
          acceptedByTechnicalStaff: false
        }
      },
      error: new Error('Failed to update permit stage')
    }]);

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
    renderModal([mockSuccessfulAccept]);

    fireEvent.click(screen.getByTestId('accept-button'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application accepted successfully');
      expect(defaultProps.onReviewComplete).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
