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
      expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /unsubmit/i })).toBeInTheDocument();
   });

   it('calls onUnsubmit when unsubmit button is clicked', () => {
      renderComponent();

      const unsubmitButton = screen.getByRole('button', { name: /unsubmit/i });
      fireEvent.click(unsubmitButton);

      expect(mockFunctions.onUnsubmit).toHaveBeenCalledWith(mockApp);
   });

   it('renders correctly for a draft application', () => {
      const draftApp = { ...mockApp, status: 'Draft' };
      renderComponent(draftApp);

      expect(screen.queryByRole('button', { name: /unsubmit/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
   });

   it('calls onSubmit when submit button is clicked', () => {
      const draftApp = { ...mockApp, status: 'Draft' };
      renderComponent(draftApp);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      expect(mockFunctions.onSubmit).toHaveBeenCalledWith(draftApp);
   });
});
