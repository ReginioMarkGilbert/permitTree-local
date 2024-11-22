import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import PaymentPage from '../../../pages/user/PaymentPage';

// Mock the hooks
vi.mock('../../../pages/user/hooks/usePaymentProcess', () => ({
  usePaymentProcess: vi.fn(() => ({
    currentStep: 1,
    formData: {},
    setFormData: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    handlePayment: vi.fn()
  }))
}));

const mockOOPData = {
  getOOPById: {
    _id: '1',
    billNo: 'BILL-001',
    applicationId: 'APP-001',
    applicationNumber: 'APP-2024-001',
    totalAmount: 1000,
    OOPstatus: 'AwaitingPayment',
    items: [
      { description: 'Processing Fee', amount: 500 },
      { description: 'Registration Fee', amount: 500 }
    ]
  }
};

const GET_OOP_DETAILS = gql`
  query GetOOPDetails($id: ID!) {
    getOOPById(id: $id) {
      _id
      billNo
      applicationId
      applicationNumber
      totalAmount
      OOPstatus
      items {
        description
        amount
      }
    }
  }
`;

const mocks = [
  {
    request: {
      query: GET_OOP_DETAILS,
      variables: { id: '1' }
    },
    result: {
      data: mockOOPData
    }
  }
];

describe('PaymentPage', () => {
  const renderComponent = (customMocks = mocks) => {
    return render(
      <MemoryRouter initialEntries={['/payment/1']}>
        <Routes>
          <Route
            path="/payment/:oopId"
            element={
              <MockedProvider mocks={customMocks} addTypename={false}>
                <PaymentPage />
              </MockedProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state initially', async () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders payment information step with OOP details', async () => {
    renderComponent();

    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    }, { timeout: 2000 });

    // Then check for the payment information step
    await waitFor(() => {
      expect(screen.getByTestId('payment-information-step')).toBeInTheDocument();
      expect(screen.getByText('BILL-001')).toBeInTheDocument();
    });
  });

  it('handles error when loading OOP details', async () => {
    const errorMocks = [{
      request: {
        query: GET_OOP_DETAILS,
        variables: { id: '1' }
      },
      error: new Error('Failed to load OOP details')
    }];
    renderComponent(errorMocks);
    await waitFor(() => {
      expect(screen.getByText('Error loading payment details')).toBeInTheDocument();
    });
  });
});
