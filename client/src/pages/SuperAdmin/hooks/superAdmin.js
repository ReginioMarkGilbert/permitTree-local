import { gql } from '@apollo/client';

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      username
      firstName
      lastName
      email
      phone
      company
      address
      roles
      userType
      isActive
      lastLoginDate
      createdAt
      updatedAt
    }
  }
`;

export const ADD_USER = gql`
  mutation RegisterUser(
    $firstName: String!,
    $lastName: String!,
    $username: String!,
    $password: String!,
    $email: String!,
    $role: String!,
    $userType: String!
  ) {
    registerUser(
      firstName: $firstName,
      lastName: $lastName,
      username: $username,
      password: $password,
      email: $email,
      role: $role,
      userType: $userType
    ) {
      token
      user {
        id
        username
        firstName
        lastName
        email
        roles
        isActive
        userType
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUserProfile($id: ID!, $input: UpdateUserProfileInput!) {
    updateUserProfile(id: $id, input: $input) {
      id
      username
      firstName
      lastName
      email
      phone
      company
      address
      roles
      isActive
    }
  }
`;

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($id: ID!) {
    deactivateUser(id: $id) {
      id
      isActive
    }
  }
`;

export const ACTIVATE_USER = gql`
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id) {
      id
      isActive
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      username
    }
  }
`;

export const GET_USER_DETAILS = gql`
  query GetUserDetails($id: ID!) {
    getUserDetails(id: $id) {
      id
      username
      firstName
      lastName
      email
      phone
      company
      address
      roles
      userType
      isActive
      lastLoginDate
      createdAt
      updatedAt
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
