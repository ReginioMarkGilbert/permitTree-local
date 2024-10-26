import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import UserApplicationRow from '../../../../pages/user/components/UserApplicationRow';

// Mock the EditDraftModal and ViewApplicationModal components
vi.mock('../../../../pages/user/components/EditDraftModal', () => ({
   default: () => null,
}));

vi.mock('../../../../pages/user/components/ViewApplicationModal', () => ({
   default: () => null,
}));

vi.mock('../../../../pages/user/components/ViewRemarksModal', () => ({
   default: () => null,
}));

describe('UserApplicationRow', () => {
   const mockApp = {
      id: '1',
      applicationNumber: 'PMDQ-PTPR-2024-1019-000008',
      applicationType: 'Private Tree Plantation Registration',
      status: 'Submitted',
      dateOfSubmission: '1634567890000',
   };

   const mockFunctions = {
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onUnsubmit: vi.fn(),
      onSubmit: vi.fn(),
      getStatusColor: vi.fn(() => 'bg-blue-100 text-blue-800'),
      fetchCOVPermit: vi.fn(),
      fetchCSAWPermit: vi.fn(),
      fetchPLTPPermit: vi.fn(),
   };

   const renderComponent = (app = mockApp) => {
      return render(
         <MockedProvider mocks={[]} addTypename={false}>
            <table>
               <tbody>
                  <UserApplicationRow app={app} {...mockFunctions} />
               </tbody>
            </table>
         </MockedProvider>
      );
   };

   it('renders correctly for a submitted application', () => {
      renderComponent();

      expect(screen.getByText('PMDQ-PTPR-2024-1019-000008')).toBeInTheDocument();
      expect(screen.getByText('Private Tree Plantation Registration')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByTestId('view-button')).toBeInTheDocument();
      expect(screen.getByTestId('unsubmit-button')).toBeInTheDocument();
   });

   it('calls onUnsubmit when unsubmit button is clicked', () => {
      renderComponent();

      const unsubmitButton = screen.getByTestId('unsubmit-button');
      fireEvent.click(unsubmitButton);

      expect(mockFunctions.onUnsubmit).toHaveBeenCalledWith(mockApp);
   });

   it('renders correctly for a draft application', () => {
      const draftApp = { ...mockApp, status: 'Draft' };
      renderComponent(draftApp);

      expect(screen.queryByTestId('unsubmit-button')).not.toBeInTheDocument();
      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
   });

   it('calls onSubmit when submit button is clicked', () => {
      const draftApp = { ...mockApp, status: 'Draft' };
      renderComponent(draftApp);

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      expect(mockFunctions.onSubmit).toHaveBeenCalledWith(draftApp);
   });
});
