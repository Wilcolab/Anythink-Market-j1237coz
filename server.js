const express = require('express');

/**
 * server.js - Main entry point for the calculator app
 *
 * - Sets up the Express server
 * - Serves static frontend files
 * - Registers API routes for calculator operations
 * - Exports the app for testing
 */

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

/**
 * Imports the application's API route handlers.
 * @type {Object}
 * @module routes
 */
const routes = require("./api/routes");
routes(app);

if (!module.parent) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
