'use strict';

/**
 * controller.js - Calculator API controller
 *
 * Exposes REST API endpoints for arithmetic and advanced operations.
 *
 * Supported operations:
 * - Addition, subtraction, multiplication, division
 * - Square root, exponentiation, percentage, reciprocal
 *
 * Error handling:
 * - Returns descriptive error messages for invalid input, divide by zero, and invalid operations
 *
 * Used by the frontend (client.js) for all calculations.
 */

exports.calculate = function(req, res) {
  req.app.use(function(err, _req, res, next) {
    if (res.headersSent) {
      return next(err);
    }

    res.status(400);
    res.json({ error: err.message });
  });

  var operations = {
    'add':      function(a, b) { return Number(a) + Number(b) },
    'subtract': function(a, b) { return a - b },
    'multiply': function(a, b) { return a * b },
    'divide':   function(a, b) { return a / b },
    'sqrt':     function(a)    { return Math.sqrt(a) },
    'power':    function(a, b) { return Math.pow(a, b) },
    'percent':  function(a, b) { return a * b / 100 },
    'reciprocal': function(a)  { return 1 / a },
  };

  if (!req.query.operation) {
    res.status(400).json({ error: "Please select an operation." });
    return;
  }

  var operation = operations[req.query.operation];

  if (!operation) {
    res.status(400).json({ error: `Invalid operation: ${req.query.operation}` });
    return;
  }

  if (req.query.operation === 'sqrt' || req.query.operation === 'reciprocal') {
    if (!req.query.operand1 ||
        !req.query.operand1.match(/^(-)?[0-9\.]+(e(-)?[0-9]+)?$/) ||
        req.query.operand1.replace(/[-0-9e]/g, '').length > 1) {
      res.status(400).json({ error: `Invalid input: ${req.query.operand1}` });
      return;
    }
    if (req.query.operation === 'sqrt' && Number(req.query.operand1) < 0) {
      res.status(400).json({ error: "Cannot take square root of a negative number." });
      return;
    }
    if (req.query.operation === 'reciprocal' && Number(req.query.operand1) === 0) {
      res.status(400).json({ error: "Cannot divide by zero (reciprocal of zero)." });
      return;
    }
    res.json({ result: operations[req.query.operation](req.query.operand1) });
    return;
  }

  if (!req.query.operand1 ||
      !req.query.operand1.match(/^(-)?[0-9\.]+(e(-)?[0-9]+)?$/) ||
      req.query.operand1.replace(/[-0-9e]/g, '').length > 1) {
    res.status(400).json({ error: `Invalid input for operand1: ${req.query.operand1}` });
    return;
  }

  if (!req.query.operand2 ||
      !req.query.operand2.match(/^(-)?[0-9\.]+(e(-)?[0-9]+)?$/) ||
      req.query.operand2.replace(/[-0-9e]/g, '').length > 1) {
    res.status(400).json({ error: `Invalid input for operand2: ${req.query.operand2}` });
    return;
  }

  if (req.query.operation === 'divide' && Number(req.query.operand2) === 0) {
    res.status(400).json({ error: "Cannot divide by zero." });
    return;
  }

  res.json({ result: operation(req.query.operand1, req.query.operand2) });
};
