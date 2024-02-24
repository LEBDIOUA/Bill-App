// jest.setup.js
const { error } = console;
console.error = (message, ...args) => {
  if (message.includes('Not implemented: window.getComputedStyle')) {
    return;
  }
  error.apply(console, [message, ...args]);
};