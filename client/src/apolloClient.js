import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// import { createUploadLink } from 'apollo-upload-client';

const httpLink = createHttpLink({
   uri: 'http://localhost:3001/graphql',
});

const authLink = setContext((_, { headers }) => {
   const token = localStorage.getItem('token');
   return {
      headers: {
         ...headers,
         // authorization: token ? token : "",
         authorization: token ? `Bearer ${token}` : "",
      }
   }
});

const client = new ApolloClient({
   link: authLink.concat(httpLink),
   cache: new InMemoryCache(),
});

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