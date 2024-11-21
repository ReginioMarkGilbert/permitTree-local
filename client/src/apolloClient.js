import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// import { createUploadLink } from 'apollo-upload-client';
import { onError } from "@apollo/client/link/error";

const API_URL = 'http://172.20.10.2:3001/graphql'
// http://172.20.10.2:5174/
const httpLink = createHttpLink({
   uri: API_URL,
});

const authLink = setContext((_, { headers }) => {
   const token = localStorage.getItem('token');
   // console.log('Token being sent:', token);
   return {
      headers: {
         ...headers,
         authorization: token ? `Bearer ${token}` : "",
      }
   }
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
   if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
         console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
         )
      );
   if (networkError) console.log(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
   link: errorLink.concat(authLink.concat(httpLink)),
   cache: new InMemoryCache(),
   defaultOptions: {
      watchQuery: {
         fetchPolicy: 'cache-and-network',
      },
   },
});

// Add this logging
client.defaultOptions.watchQuery.onError = (error) => {
   console.error('Apollo Client error:', error);
};

export default client;
// Function to handle file uploads
// export const uploadFile = async (file) => {
//   const formData = new FormData();
//   formData.append('file', file);

//   const response = await fetch('http://localhost:3000/upload', {
//     method: 'POST',
//     body: formData,
//   });

//   if (!response.ok) {
//     throw new Error('File upload failed');
//   }

//   return response.json();
// };
