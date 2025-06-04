/**
 * routes.js - Calculator API routes
 *
 * Registers the /arithmetic endpoint for all calculator operations.
 *
 * Used by server.js to connect API logic to the Express app.
 */

module.exports = function (app) {
  const arithmetic = require('./controller');
  app.route('/arithmetic').get(arithmetic.calculate);
};
