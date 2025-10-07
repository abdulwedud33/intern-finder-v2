const express = require('express');
const { cleanupDatabase } = require('../controllers/cleanupController');

const router = express.Router();

// Cleanup route (no auth required for simplicity)
router.delete('/', cleanupDatabase);

module.exports = router;
