import { setupCache } from 'axios-cache-adapter';

const cache = setupCache({
  maxAge: 15 * 60 * 1000 // Cache for 15 minutes
});

export const axiosWithCache = axios.create({
  adapter: cache.adapter
});
