import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router-dom';
import { gql } from '@apollo/client';
import UserAuthPage from '../../../pages/public/UserAuthPage';
import * as sonner from 'sonner';

// Define the GraphQL mutations
const LOGIN_USER = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        firstName
        lastName
        roles
      }
    }
  }
`;

const REGISTER_USER = gql`
  mutation RegisterUser($firstName: String!, $lastName: String!, $username: String!, $password: String!) {
    registerUser(firstName: $firstName, lastName: $lastName, username: $username, password: $password) {
      token
      user {
        id
        username
        firstName
        lastName
        roles
      }
    }
  }
`;

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('UserAuthPage', () => {
  // Define GraphQL mocks
  const loginMock = {
    request: {
      query: LOGIN_USER,
      variables: {
        username: 'test_user',
        password: 'Test123!',
      },
    },
    result: {
      data: {
        login: {
          token: 'fake-token',
          user: {
            id: '1',
            username: 'test_user',
            firstName: 'Test',
            lastName: 'User',
            roles: ['user'],
          },
        },
      },
    },
  };

  const registerMock = {
    request: {
      query: REGISTER_USER,
      variables: {
        firstName: 'Test',
        lastName: 'User',
        username: 'test_user',
        password: 'Test123!',
      },
    },
    result: {
      data: {
        registerUser: {
          token: 'fake-token',
          user: {
            id: '1',
            username: 'test_user',
            firstName: 'Test',
            lastName: 'User',
            roles: ['user'],
          },
        },
      },
    },
  };

  const renderComponent = (mocks = []) => {
    return render(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserAuthPage />
        </MockedProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('renders login form by default', () => {
      renderComponent();
      expect(screen.getByTestId('login-username')).toBeInTheDocument();
      expect(screen.getByTestId('login-password')).toBeInTheDocument();
      expect(screen.getByTestId('signin-submit')).toBeInTheDocument();
    });

    it('validates required fields on login', async () => {
      renderComponent();
      const signInButton = screen.getByTestId('signin-submit');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('login-username')).toBeInvalid();
        expect(screen.getByTestId('login-password')).toBeInvalid();
      });
    });

    it('successfully logs in user', async () => {
      renderComponent([loginMock]);

      // Fill in login form
      fireEvent.change(screen.getByTestId('login-username'), {
        target: { value: 'test_user' },
      });
      fireEvent.change(screen.getByTestId('login-password'), {
        target: { value: 'Test123!' },
      });

      // Submit form
      const signInButton = screen.getByTestId('signin-submit');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('fake-token');
        expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
        expect(sonner.toast.success).toHaveBeenCalledWith('Login successful!');
      });
    });

    it('handles login error', async () => {
      const errorMock = {
        request: loginMock.request,
        error: new Error('Invalid credentials'),
      };

      renderComponent([errorMock]);

      // Fill in login form
      fireEvent.change(screen.getByTestId('login-username'), {
        target: { value: 'test_user' },
      });
      fireEvent.change(screen.getByTestId('login-password'), {
        target: { value: 'wrong_password' },
      });

      // Submit form
      const signInButton = screen.getByTestId('signin-submit');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(sonner.toast.error).toHaveBeenCalledWith('Login failed: Invalid credentials');
      });
    });
  });

  describe('Registration Flow', () => {
    beforeEach(() => {
      renderComponent([registerMock]);
      // Switch to registration tab
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      fireEvent.click(signUpTab);
    });

    it('renders registration form when switched to signup tab', () => {
      expect(screen.getByTestId('first-name')).toBeInTheDocument();
      expect(screen.getByTestId('last-name')).toBeInTheDocument();
      expect(screen.getByTestId('username')).toBeInTheDocument();
      expect(screen.getByTestId('signup-password')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-password')).toBeInTheDocument();
    });

    it('validates password requirements', async () => {
      // Fill in registration form with weak password
      fireEvent.change(screen.getByTestId('first-name'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByTestId('last-name'), {
        target: { value: 'User' },
      });
      fireEvent.change(screen.getByTestId('signup-password'), {
        target: { value: 'weak' },
      });

      // Submit form
      fireEvent.click(screen.getByTestId('signup-submit'));

      await waitFor(() => {
        expect(screen.getByText(/Password must include at least one uppercase letter/i)).toBeInTheDocument();
        expect(screen.getByText(/Password must include at least one number/i)).toBeInTheDocument();
        expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
      });
    });

    it('successfully registers new user', async () => {
      // Fill in registration form
      fireEvent.change(screen.getByTestId('first-name'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByTestId('last-name'), {
        target: { value: 'User' },
      });
      fireEvent.change(screen.getByTestId('signup-password'), {
        target: { value: 'Test123!' },
      });
      fireEvent.change(screen.getByTestId('confirm-password'), {
        target: { value: 'Test123!' },
      });

      // Submit form
      fireEvent.click(screen.getByTestId('signup-submit'));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('fake-token');
        expect(mockNavigate).toHaveBeenCalledWith('/home?newUser=true', { replace: true });
        expect(sonner.toast.success).toHaveBeenCalledWith('Signup successful!');
      });
    });
  });
});
