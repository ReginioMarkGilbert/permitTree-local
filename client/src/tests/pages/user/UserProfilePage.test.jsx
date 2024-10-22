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

const mocks = [
  {
    request: {
      query: GET_USER_DETAILS,
    },
    result: {
      data: {
        getUserDetails: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          company: 'Example Inc.',
          address: '123 Main St',
          profilePicture: null,
        },
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
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '1234567890',
          company: 'Example Inc.',
          address: '123 Main St',
          profilePicture: null,
        },
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
          removeProfilePicture: false,
        },
      },
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
          profilePicture: null,
        },
      },
    },
  },
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

  it('renders user profile data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Example Inc.')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
    });
  });

  it('allows editing user profile', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit Profile'));

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'new.email@example.com' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });
});
