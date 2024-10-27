import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import RRC_ApplicationRow from '../../../../../pages/Personnel/components/PersonnelDashboardComponents/ReceivingReleasingClerk/RRC_ApplicationRow';

// Mock the child components
vi.mock('../../../../../pages/Personnel/components/PersonnelDashboardComponents/TechnicalStaff/TS_ViewModal', () => ({
  default: ({ isOpen, onClose }) => isOpen ? <div>Mock View Modal<button onClick={onClose}>Close</button></div> : null
}));

vi.mock('../../../../../pages/Personnel/components/PersonnelDashboardComponents/ReceivingReleasingClerk/RRC_RecordModal', () => ({
  default: ({ isOpen, onClose }) => isOpen ? <div>Mock Record Modal<button onClick={onClose}>Close</button></div> : null
}));

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

  const renderRow = (app = mockApp) => {
    return render(
      <table>
        <tbody>
          <RRC_ApplicationRow
            app={app}
            onRecordComplete={mockOnRecordComplete}
            getStatusColor={mockGetStatusColor}
          />
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
    expect(screen.getByText('Mock View Modal')).toBeInTheDocument();
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
    expect(screen.getByText('Mock Record Modal')).toBeInTheDocument();
  });
});
