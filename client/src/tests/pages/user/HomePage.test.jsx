import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import { gql } from '@apollo/client';
import HomePage from '../../../pages/user/HomePage';
import { useRecentApplications } from '../../../pages/user/hooks/useRecentApplications';

// Mock the hooks
vi.mock('../../../pages/user/hooks/useRecentApplications');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({
      pathname: "/home",
      search: "",
      hash: "",
      state: null
    })
  };
});

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
    },
    {
      id: '2',
      applicationNumber: 'APP-002',
      applicationType: 'Test Type 2',
      status: 'Draft',
      dateOfSubmission: '1634567891000',
    },
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
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    });
  });

  it('renders quick action buttons', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('New Application')).toBeInTheDocument();
      expect(screen.getByText('My Applications')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  it('renders recent applications', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/APP-001/)).toBeInTheDocument();
      expect(screen.getByText(/APP-002/)).toBeInTheDocument();
      expect(screen.getByText('Test Type 1')).toBeInTheDocument();
      expect(screen.getByText('Test Type 2')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  it('shows loading state for recent applications', async () => {
    useRecentApplications.mockReturnValue({
      recentApplications: [],
      loading: true,
      error: null,
    });

    renderWithProviders(<HomePage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state for recent applications', async () => {
    useRecentApplications.mockReturnValue({
      recentApplications: [],
      loading: false,
      error: new Error('Failed to fetch applications'),
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch applications/)).toBeInTheDocument();
    });
  });

  it('shows "No recent applications" when there are no applications', async () => {
    useRecentApplications.mockReturnValue({
      recentApplications: [],
      loading: false,
      error: null,
    });

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('No recent applications')).toBeInTheDocument();
    });
  });
});
