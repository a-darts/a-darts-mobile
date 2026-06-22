/** @type {import("jest").Config} **/
module.exports = {
  projects: [
    // --- CONFIGURACIÓN PARA EL BACKEND ---
    {
      displayName: "backend",
      testEnvironment: "node",
      transform: {
        "^.+\\.tsx?$": ["ts-jest", {}],
      },
      testMatch: ["**/backend/tests/**/*.test.ts"],
      coverageDirectory: "./backend/tests/coverage",
    },

    // --- CONFIGURACIÓN PARA EL FRONTEND MÓVIL (EXPO) ---
    {
      displayName: "mobile",
      preset: "jest-expo",
      testEnvironment: "node",
      setupFilesAfterEnv: [
        "@testing-library/jest-native/extend-expect",
        "<rootDir>/jest.setup.js",
      ],
      testMatch: [
        "**/frontend/tests/**/*.test.ts",
        "**/frontend/tests/**/*.test.tsx",
      ],
      transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
      ],
      coverageDirectory: "./frontend/tests/coverage",
    }
  ]
};
