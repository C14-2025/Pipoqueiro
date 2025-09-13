import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.BroadcastChannel = function() {
  return {
    addEventListener: () => {},
    postMessage: () => {},
    close: () => {},
  };
};
