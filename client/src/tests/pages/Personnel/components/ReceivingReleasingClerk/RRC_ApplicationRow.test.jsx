import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import RRC_ApplicationRow from '@/pages/Personnel/components/PersonnelDashboardComponents/ReceivingReleasingClerk/RRC_ApplicationRow';
import { gql } from '@apollo/client';

// Mock the child components
vi.mock('@/pages/Personnel/components/PersonnelDashboardComponents/TechnicalStaff/TS_ViewModal', () => ({
  default: ({ isOpen, onClose }) => isOpen ? (
    <tr>
      <td colSpan={5} data-testid="mock-view-modal">
        Mock View Modal
        <button onClick={onClose}>Close</button>
      </td>
    </tr>
  ) : null
}));

vi.mock('@/pages/Personnel/components/PersonnelDashboardComponents/ReceivingReleasingClerk/RRC_RecordModal', () => ({
  default: ({ isOpen, onClose }) => isOpen ? (
    <tr>
      <td colSpan={5} data-testid="mock-record-modal">
        Mock Record Modal
        <button onClick={onClose}>Close</button>
      </td>
    </tr>
  ) : null
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

describe('RRC_ApplicationRow', () => {
  const mockApp = {
    id: '1',
    applicationNumber: 'APP-001',
    applicationType: 'Chainsaw Registration',
    dateOfSubmission: new Date().toISOString(),
    status: 'In Progress',
    currentStage: 'ForRecordByReceivingClerk',
    recordedByReceivingClerk: false
  };

  const mockOnRecordComplete = vi.fn();
  const mockGetStatusColor = vi.fn().mockReturnValue('bg-yellow-100 text-yellow-800');

  const mocks = [
    {
      request: {
        query: UPDATE_PERMIT_STAGE,
        variables: {
          id: '1',
          currentStage: 'ForRecordByReceivingClerk',
          status: 'In Progress',
          notes: 'Record undone by Receiving Clerk',
          recordedByReceivingClerk: false
        }
      },
      result: {
        data: {
          updatePermitStage: {
            id: '1',
            currentStage: 'ForRecordByReceivingClerk',
            status: 'In Progress',
            recordedByReceivingClerk: false,
            history: []
          }
        }
      }
    }
  ];

  const renderRow = (app = mockApp, currentTab = '') => {
    return render(
      <table>
        <tbody>
          <MockedProvider mocks={mocks} addTypename={false}>
            <RRC_ApplicationRow
              app={app}
              onRecordComplete={mockOnRecordComplete}
              getStatusColor={mockGetStatusColor}
              currentTab={currentTab}
            />
          </MockedProvider>
        </tbody>
      </table>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders application details correctly', () => {
    renderRow();
    expect(screen.getByText(mockApp.applicationNumber)).toBeInTheDocument();
    expect(screen.getByText(mockApp.applicationType)).toBeInTheDocument();
    expect(screen.getByText(mockApp.status)).toBeInTheDocument();
  });

  it('shows view modal when clicking view button', () => {
    renderRow();
    fireEvent.click(screen.getByTestId('view-button'));
    expect(screen.getByTestId('mock-view-modal')).toBeInTheDocument();
  });

  it('shows record button for unrecorded applications in correct stage', () => {
    renderRow();
    expect(screen.getByTestId('record-button')).toBeInTheDocument();
  });

  it('hides record button for already recorded applications', () => {
    const recordedApp = { ...mockApp, recordedByReceivingClerk: true };
    renderRow(recordedApp);
    expect(screen.queryByTestId('record-button')).not.toBeInTheDocument();
  });

  it('hides record button for applications in wrong stage', () => {
    const wrongStageApp = { ...mockApp, currentStage: 'ChiefRPSReview' };
    renderRow(wrongStageApp);
    expect(screen.queryByTestId('record-button')).not.toBeInTheDocument();
  });

  it('shows record modal when clicking record button', () => {
    renderRow();
    fireEvent.click(screen.getByTestId('record-button'));
    expect(screen.getByTestId('mock-record-modal')).toBeInTheDocument();
  });
});
