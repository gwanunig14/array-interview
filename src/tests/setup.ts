import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/**
 * jsdom does not implement window.matchMedia; provide a minimal stub so any
 * component code that calls it (or media-query hooks) does not throw.
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
