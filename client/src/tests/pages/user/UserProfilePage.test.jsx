import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import UserProfilePage from '../../../pages/user/UserProfilePage';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock the toast function
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const GET_USER_DETAILS = gql`
  query GetUserDetails {
    getUserDetails {
      id
      firstName
      lastName
      email
      phone
      company
      address
      profilePicture {
        data
        contentType
      }
      lastPasswordChange
      recentActivities {
        id
        type
        timestamp
        details
      }
      stats {
        totalApplications
        activePermits
        pendingPayments
      }
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      firstName
      lastName
      email
      phone
      company
      address
      profilePicture {
        data
        contentType
      }
    }
  }
`;

const mockUserData = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '1234567890',
  company: 'Example Inc.',
  address: '123 Main St',
  profilePicture: null,
  lastPasswordChange: new Date().toISOString(),
  recentActivities: [
    {
      id: '1',
      type: 'LOGIN',
      timestamp: new Date().toISOString(),
      details: 'User logged in'
    },
    {
      id: '2',
      type: 'PROFILE_UPDATE',
      timestamp: new Date().toISOString(),
      details: 'Profile information updated'
    }
  ],
  stats: {
    totalApplications: 8,
    activePermits: 0,
    pendingPayments: 0
  }
};

const mocks = [
  {
    request: {
      query: GET_USER_DETAILS,
    },
    result: {
      data: {
        getUserDetails: mockUserData
      },
    },
  },
  {
    request: {
      query: GET_USER_DETAILS,
    },
    result: {
      data: {
        getUserDetails: {
          ...mockUserData,
          email: 'new.email@example.com'
        }
      },
    },
  },
  {
    request: {
      query: UPDATE_USER_PROFILE,
      variables: {
        input: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'new.email@example.com',
          phone: '1234567890',
          company: 'Example Inc.',
          address: '123 Main St',
          removeProfilePicture: false
        }
      }
    },
    result: {
      data: {
        updateUserProfile: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'new.email@example.com',
          phone: '1234567890',
          company: 'Example Inc.',
          address: '123 Main St',
          profilePicture: null
        }
      }
    }
  }
];

describe('UserProfilePage', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfilePage />
        </MockedProvider>
      </MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toHaveClass('animate-spin');
  });

  it('renders user profile data', async () => {
    renderComponent();

    await waitFor(() => {
      // Profile Information
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Example Inc.')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();

      // Account Overview - use getByRole to be more specific
      const totalApps = screen.getByRole('heading', { name: /total applications/i })
        .nextElementSibling;
      expect(totalApps).toHaveTextContent('8');

      const activePermits = screen.getByRole('heading', { name: /active permits/i })
        .nextElementSibling;
      expect(activePermits).toHaveTextContent('0');

      const pendingPayments = screen.getByRole('heading', { name: /pending payments/i })
        .nextElementSibling;
      expect(pendingPayments).toHaveTextContent('0');

      // Recent Activity
      expect(screen.getByText('Last login')).toBeInTheDocument();
      expect(screen.getByText('Profile updated')).toBeInTheDocument();
    });
  });

  it('allows editing user profile', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    // Click edit button
    fireEvent.click(screen.getByText('Edit Profile'));

    // Verify inputs are enabled
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).not.toBeDisabled();

    // Change email
    fireEvent.change(emailInput, { target: { value: 'new.email@example.com' } });
    expect(emailInput).toHaveValue('new.email@example.com');

    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));

    // Verify edit mode is exited
    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  it('shows change password dialog', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Change Password'));

    await waitFor(() => {
      expect(screen.getByText('Make sure to remember your new password.')).toBeInTheDocument();
    });
  });
});
