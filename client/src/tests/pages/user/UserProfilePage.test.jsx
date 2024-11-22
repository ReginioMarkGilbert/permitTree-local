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
      username
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
  username: 'johndoe',
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

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Then check the rendered data
    await waitFor(() => {
      // Check form inputs
      const fullNameInput = screen.getByLabelText('Full Name');
      const usernameInput = screen.getByLabelText('Username');
      const emailInput = screen.getByLabelText('Email');
      const phoneInput = screen.getByLabelText('Phone');
      const companyInput = screen.getByLabelText('Company');
      const addressInput = screen.getByLabelText('Complete Address');

      // The component combines firstName and lastName into fullName
      expect(fullNameInput).toHaveValue(`${mockUserData.firstName} ${mockUserData.lastName}`);
      expect(usernameInput).toHaveValue(mockUserData.username);
      expect(emailInput).toHaveValue(mockUserData.email);
      expect(phoneInput).toHaveValue(mockUserData.phone);
      expect(companyInput).toHaveValue(mockUserData.company);
      expect(addressInput).toHaveValue(mockUserData.address);

      // Check stats
      const stats = screen.getAllByRole('heading', { level: 4 });
      const totalAppsHeading = stats.find(heading =>
        heading.textContent.toLowerCase().includes('total applications')
      );
      const totalAppsValue = totalAppsHeading?.nextElementSibling;
      expect(totalAppsValue).toHaveTextContent('8');
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
