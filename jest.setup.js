import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Inyectamos el mock oficial provisto por la librería
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

if (!global.fetch) {
    global.fetch = jest.fn();
}
