import { gql } from '@apollo/client';

export const UPDATE_COV_PERMIT = gql`
  mutation UpdateCOVPermit($id: ID!, $input: COVPermitInput!) {
    updateCOVPermit(id: $id, input: $input) {
      id
      name
      address
      cellphone
      purpose
      driverName
      driverLicenseNumber
      vehiclePlateNumber
      originAddress
      destinationAddress
    }
  }
`;
