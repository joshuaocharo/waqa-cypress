require('dotenv').config();
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
  env: {
    WEATHER_BASE_URL: process.env.WEATHER_BASE_URL,
    WEATHER_API_KEY: process.env.WEATHER_API_KEY,
  },
  e2e: {
    specPattern: 'cypress/api/**/*_spec.js',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
  },
});