import './commands.js';
import '@4tw/cypress-drag-drop';

Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});