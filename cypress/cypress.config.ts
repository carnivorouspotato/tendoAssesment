import { defineConfig } from 'cypress';
import mysql from 'mysql';

export default defineConfig({
  reporter: 'mochawesome',
  reporterOptions: {
    reportFilename: 'index',
    reportDir: 'cypress/results'
  },
  chromeWebSecurity: false,
  fixturesFolder: false,
  viewportWidth: 1920,
  viewportHeight: 1200,
  watchForFileChanges: false,
  video: false,
  includeShadowDom: true,
  e2e: {
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 120000,
    requestTimeout: 5000,
    responseTimeout: 30000,
    taskTimeout: 60000,

    retries: {
      runMode: 1,
      openMode: 0
    },
    setupNodeEvents(on, config) {
    // Your MySQL configuration

    const mysqlConfig = {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'http://localhost:3000/databricks'
    };
    on('task', {
      query(sql: string, params: any[] = []) {
        return new Promise((resolve, reject) => {
          const connection = mysql.createConnection(mysqlConfig);
          connection.query(sql, params, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
            connection.end();
          });
        });
      }
    });

      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.isHeadless === true) {
          launchOptions.args.push('--window-size=1920,1200');
          return launchOptions;
        }
      });

      return config;
    },
    excludeSpecPattern: '*.studio.*',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'
  }
});
