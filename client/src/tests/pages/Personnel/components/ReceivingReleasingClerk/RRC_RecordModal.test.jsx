import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import { toast } from 'sonner';
import { gql } from '@apollo/client';
import RRC_RecordModal from '@/pages/Personnel/components/PersonnelDashboardComponents/ReceivingReleasingClerk/RRC_RecordModal';

vi.mock('sonner', () => ({
   toast: {
      success: vi.fn(),
      error: vi.fn(),
   },
}));

const UPDATE_PERMIT_STAGE = gql`
  mutation UpdatePermitStage(
    $id: ID!,
    $currentStage: String!,
    $status: String!,
    $notes: String,
    $recordedByReceivingClerk: Boolean
  ) {
    updatePermitStage(
      id: $id,
      currentStage: $currentStage,
      status: $status,
      notes: $notes,
      recordedByReceivingClerk: $recordedByReceivingClerk
    ) {
      id
      currentStage
      status
      recordedByReceivingClerk
      history {
        notes
        timestamp
      }
    }
  }
`;

describe('RRC_RecordModal', () => {
   const mockApplication = {
      id: '1',
      applicationNumber: 'APP-001',
      status: 'In Progress',
      currentStage: 'ForRecordByReceivingClerk',
      applicationType: 'Chainsaw Registration'
   };

   const mockOnClose = vi.fn();
   const mockOnRecordComplete = vi.fn();

   const successMock = {
      request: {
         query: UPDATE_PERMIT_STAGE,
         variables: {
            id: '1',
            currentStage: 'ChiefRPSReview',
            status: 'In Progress',
            notes: 'Application recorded by receiving clerk and forwarded to ChiefRPSReview',
            recordedByReceivingClerk: true
         }
      },
      result: {
         data: {
            updatePermitStage: {
               id: '1',
               currentStage: 'ChiefRPSReview',
               status: 'In Progress',
               recordedByReceivingClerk: true,
               history: [
                  {
                     notes: 'Application recorded by receiving clerk and forwarded to ChiefRPSReview',
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
            currentStage: 'ChiefRPSReview',
            status: 'In Progress',
            notes: 'Application recorded by receiving clerk and forwarded to ChiefRPSReview',
            recordedByReceivingClerk: true
         }
      },
      error: new Error('Failed to update permit stage')
   };

   const renderModal = (mocks = []) => {
      return render(
         <MockedProvider mocks={mocks} addTypename={false}>
            <RRC_RecordModal
               isOpen={true}
               onClose={mockOnClose}
               application={mockApplication}
               onRecordComplete={mockOnRecordComplete}
            />
         </MockedProvider>
      );
   };

   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('renders the modal with application details', () => {
      renderModal();
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Record Application');
      expect(screen.getByText(`Application Number: ${mockApplication.applicationNumber}`)).toBeInTheDocument();
      expect(screen.getByTestId('record-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
   });

   it('successfully records application', async () => {
      renderModal([successMock]);
      fireEvent.click(screen.getByTestId('record-button'));

      await waitFor(() => {
         expect(toast.success).toHaveBeenCalledWith('Application recorded successfully');
         expect(mockOnRecordComplete).toHaveBeenCalled();
         expect(mockOnClose).toHaveBeenCalled();
      });
   });

   it('handles error when recording application', async () => {
      renderModal([errorMock]);
      fireEvent.click(screen.getByTestId('record-button'));

      await waitFor(() => {
         expect(toast.error).toHaveBeenCalledWith('Error recording application: Failed to update permit stage');
      });
   });

   it('closes modal when clicking Cancel', () => {
      renderModal();
      fireEvent.click(screen.getByTestId('cancel-button'));
      expect(mockOnClose).toHaveBeenCalled();
   });
});
