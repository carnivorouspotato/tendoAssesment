import './commands';
import 'cypress-file-upload';
import 'cypress-localstorage-commands';
import 'cypress-xpath';
import 'cypress-iframe';
import 'cypress-real-events/support';


Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});



