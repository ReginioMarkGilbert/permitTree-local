import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Add any global setup for your tests here
