import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { gql } from '@apollo/client';
import Home from '../../../pages/user/UserHomePage.jsx';
import { useRecentApplications } from '../../../pages/user/hooks/useUserRecentApplications';

// Mock the hooks
vi.mock('../../../pages/user/hooks/useUserRecentApplications', () => ({
  useRecentApplications: vi.fn()
}));

// Mock the GET_USER_DETAILS query
const GET_USER_DETAILS = gql`
  query GetUserDetails {
    me {
      firstName
      lastName
    }
  }
`;

describe('HomePage', () => {
  const mockRecentApplications = [
    {
      id: '1',
      applicationNumber: 'APP-001',
      applicationType: 'Test Type 1',
      status: 'Submitted',
      dateOfSubmission: '1634567890000',
    }
  ];

  const mocks = [
    {
      request: {
        query: GET_USER_DETAILS,
      },
      result: {
        data: {
          me: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      },
    },
  ];

  beforeEach(() => {
    useRecentApplications.mockReturnValue({
      recentApplications: mockRecentApplications,
      loading: false,
      error: null,
      refetch: vi.fn()
    });
  });

  const renderWithProviders = (ui) => {
    return render(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          {ui}
        </MockedProvider>
      </MemoryRouter>
    );
  };

  it('renders welcome message with user name', async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    });
  });

  it('renders quick action buttons', async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText('New Application')).toBeInTheDocument();
      expect(screen.getByText('My Applications')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  it('renders recent applications', async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/APP-001/)).toBeInTheDocument();
      expect(screen.getByText('Test Type 1')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
    });
  });
});
