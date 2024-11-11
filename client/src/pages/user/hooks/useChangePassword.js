import { gql, useMutation } from '@apollo/client';

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const useChangePassword = () => {
  const [changePassword, { data, loading, error }] = useMutation(CHANGE_PASSWORD);
  return { changePassword, data, loading, error };
};
