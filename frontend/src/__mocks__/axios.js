// src/__mocks__/axios.js

export default {
  // Mocka o método .create() para que ele retorne um objeto
  // com a estrutura que seu código espera (com interceptors, get, post, etc.)
  create: jest.fn(function () {
    return this;
  }),

  // Mocka os interceptors para evitar o erro
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },

  // Mocka os métodos de requisição (get, post, etc.)
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
};