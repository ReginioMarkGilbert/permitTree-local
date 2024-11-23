import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

// const API_URL = 'http://172.20.10.2:3001/graphql' // local network
// const API_URL = 'http://localhost:3001/graphql' // local
// const API_URL = 'https://permittree-backend.vercel.app/';
// const API_URL = 'http://localhost:3001/graphql' || 'https://permittree-backend.vercel.app';
const API_URL = 'https://permittree-backend.vercel.app/graphql'; // online
// const API_URL = import.meta.env.VITE_API_URL;

const httpLink = createHttpLink({
   uri: API_URL,
   credentials: 'include',
   headers: {
      'Content-Type': 'application/json',
   }
});

const authLink = setContext((_, { headers }) => {
   const token = localStorage.getItem('token');
   return {
      headers: {
         ...headers,
         authorization: token ? `Bearer ${token}` : "",
         'apollo-require-preflight': 'true'
      },
      credentials: 'include'
   }
});

const retryLink = new RetryLink({
   delay: {
      initial: 300,
      max: 3000,
      jitter: true
   },
   attempts: {
      max: 5,
      retryIf: (error, _operation) => {
         return !(error.message?.includes('Failed to fetch') ||
            error.message?.includes('CORS'));
      },
   },
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
   if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
         console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
         );
      });
   }

   if (networkError) {
      console.error(`[Network error]: ${networkError}`);
      if (networkError.statusCode === 401) {
         localStorage.removeItem('token');
         window.location.href = '/auth';
      }
   }

   return forward(operation);
});

const client = new ApolloClient({
   link: from([retryLink, errorLink, authLink, httpLink]),
   cache: new InMemoryCache(),
   defaultOptions: {
      watchQuery: {
         fetchPolicy: 'network-only',
         nextFetchPolicy: 'cache-first',
         notifyOnNetworkStatusChange: true,
      },
      query: {
         fetchPolicy: 'network-only',
         errorPolicy: 'all',
      },
      mutate: {
         errorPolicy: 'all',
      },
   },
});

export default client;
