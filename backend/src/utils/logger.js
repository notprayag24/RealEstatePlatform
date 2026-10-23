// src/utils/logger.js - Logging configuration
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Simple logger implementation
const logger = {
  info: (message) => {
    const logMessage = `[${new Date().toISOString()}] [INFO] ${message}`;
    console.log('\x1b[32m%s\x1b[0m', logMessage);
    appendToFile('combined.log', logMessage);
  },
  error: (message) => {
    const logMessage = `[${new Date().toISOString()}] [ERROR] ${message}`;
    console.error('\x1b[31m%s\x1b[0m', logMessage);
    appendToFile('error.log', logMessage);
  },
  warn: (message) => {
    const logMessage = `[${new Date().toISOString()}] [WARN] ${message}`;
    console.warn('\x1b[33m%s\x1b[0m', logMessage);
    appendToFile('combined.log', logMessage);
  },
};

const appendToFile = (filename, message) => {
  const filePath = path.join(logDir, filename);
  fs.appendFile(filePath, message + '\n', (err) => {
    if (err) console.error('Failed to write log:', err);
  });
};

module.exports = logger;