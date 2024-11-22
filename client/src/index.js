import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client';

const httpLink = createUploadLink({
   uri: 'http://localhost:3000/graphql',
});

const authLink = setContext((_, { headers }) => {
   const token = localStorage.getItem('token');
   return {
      headers: {
         ...headers,
         authorization: token ? token : "",
      }
   }
});

const client = new ApolloClient({
   link: authLink.concat(httpLink),
   cache: new InMemoryCache()
});

export default client;
