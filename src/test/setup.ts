// Global test setup for Vitest + jsdom
// Runs before every test file via vite.config.ts → test.setupFiles

// Stub window.confirm so hooks that call it (deleteStop, resetAll) don't hang
Object.defineProperty(window, "confirm", {
  writable: true,
  value: () => true,
});
