#!/usr/bin/env node

/**
 * Diagnostic Script for Expense MCP Server
 *
 * This script tests various aspects of the MCP server setup
 * Run with: node diagnose.js
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(title) {
  console.log('');
  log(`${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
  console.log('');
}

async function checkFile(path, description) {
  if (existsSync(path)) {
    success(`${description} exists: ${path}`);
    return true;
  } else {
    error(`${description} not found: ${path}`);
    return false;
  }
}

async function checkNodeVersion() {
  section('Node.js Version Check');
  try {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);

    info(`Node.js version: ${version}`);

    if (majorVersion >= 18) {
      success('Node.js version meets requirements (>= 18.0.0)');
      return true;
    } else {
      error(`Node.js version too old. Required: >= 18.0.0, Current: ${version}`);
      return false;
    }
  } catch (err) {
    error(`Failed to check Node.js version: ${err.message}`);
    return false;
  }
}

async function checkFiles() {
  section('File System Check');

  const distIndexPath = resolve(__dirname, 'dist', 'index.js');
  const distClientPath = resolve(__dirname, 'dist', 'client', 'expenseClient.js');
  const distToolsPath = resolve(__dirname, 'dist', 'tools', 'expenseTools.js');
  const envPath = resolve(__dirname, '.env');

  const checks = [
    await checkFile(distIndexPath, 'Main MCP server file'),
    await checkFile(distClientPath, 'Expense client file'),
    await checkFile(distToolsPath, 'Expense tools file'),
    await checkFile(envPath, 'Environment file'),
  ];

  if (!checks.every(check => check)) {
    warning('Some files are missing. Run: npm run build');
    return false;
  }

  return true;
}

async function checkExpenseAPI() {
  section('Expense API Check');

  const apiUrl = process.env.EXPENSE_API_URL || 'http://localhost:3000';
  info(`Checking API at: ${apiUrl}`);

  try {
    // Check health endpoint
    const healthResponse = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
    if (healthResponse.status === 200) {
      success('API health check passed');
    }
  } catch (err) {
    error(`API health check failed: ${err.message}`);
    warning('Make sure the Expense API is running on port 3000');
    warning('Run: cd ../expense-api && npm start');
    return false;
  }

  try {
    // Check expenses endpoint
    const expensesResponse = await axios.get(`${apiUrl}/api/expenses`, { timeout: 5000 });
    if (expensesResponse.status === 200) {
      const expenses = expensesResponse.data;
      success(`API expenses endpoint working (${expenses.length} expenses found)`);
      return true;
    }
  } catch (err) {
    error(`API expenses endpoint failed: ${err.message}`);
    return false;
  }

  return false;
}

async function testMCPServerStartup() {
  section('MCP Server Startup Test');

  return new Promise((resolve) => {
    const distPath = resolve(__dirname, 'dist', 'index.js');

    info('Starting MCP server...');

    const serverProcess = spawn('node', [distPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let output = '';
    let errorOutput = '';
    let startupMessageFound = false;

    const timeout = setTimeout(() => {
      serverProcess.kill();
      if (startupMessageFound) {
        success('MCP server started successfully');
        resolve(true);
      } else {
        error('MCP server did not start properly (no startup message)');
        if (errorOutput) {
          info(`Error output: ${errorOutput}`);
        }
        resolve(false);
      }
    }, 3000);

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      const message = data.toString();
      errorOutput += message;

      if (message.includes('Expense MCP Server running')) {
        startupMessageFound = true;
      }
    });

    serverProcess.on('error', (err) => {
      clearTimeout(timeout);
      error(`Failed to start MCP server: ${err.message}`);
      resolve(false);
    });

    serverProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        error(`MCP server exited with code ${code}`);
        if (errorOutput) {
          info(`Error output: ${errorOutput}`);
        }
        resolve(false);
      }
    });
  });
}

async function checkEnvironmentVariables() {
  section('Environment Variables Check');

  const apiUrl = process.env.EXPENSE_API_URL || 'http://localhost:3000';
  info(`EXPENSE_API_URL: ${apiUrl}`);

  if (apiUrl === 'http://localhost:3000') {
    warning('Using default API URL (http://localhost:3000)');
  } else {
    success(`Custom API URL configured: ${apiUrl}`);
  }

  return true;
}

async function generateClaudeConfig() {
  section('Claude Desktop Configuration');

  const distPath = resolve(__dirname, 'dist', 'index.js');
  const configPath = distPath.replace(/\\/g, '\\\\');

  info('Add this to your Claude Desktop config file:');
  info('Location: %APPDATA%\\Claude\\claude_desktop_config.json\n');

  const config = {
    mcpServers: {
      'expense-mcp': {
        command: 'node',
        args: [configPath],
        env: {
          EXPENSE_API_URL: 'http://localhost:3000',
        },
      },
    },
  };

  console.log(JSON.stringify(config, null, 2));
  console.log('');

  return true;
}

async function runAllDiagnostics() {
  log('', 'reset');
  log('╔════════════════════════════════════════════════════════╗', 'blue');
  log('║         Expense MCP Server Diagnostic Tool            ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  log('', 'reset');

  const results = {
    nodeVersion: await checkNodeVersion(),
    files: await checkFiles(),
    env: await checkEnvironmentVariables(),
    api: await checkExpenseAPI(),
    startup: await testMCPServerStartup(),
  };

  await generateClaudeConfig();

  section('Summary');

  const allPassed = Object.values(results).every(result => result);

  if (allPassed) {
    success('All diagnostic checks passed! ✨');
    info('Your MCP server is ready to use with Claude Desktop');
    info('');
    info('Next steps:');
    info('1. Copy the configuration above to your Claude Desktop config');
    info('2. Restart Claude Desktop completely');
    info('3. Try asking Claude: "Show me all expenses"');
  } else {
    error('Some diagnostic checks failed');
    info('');
    info('Failed checks:');
    if (!results.nodeVersion) warning('  - Node.js version');
    if (!results.files) warning('  - File system (run: npm run build)');
    if (!results.env) warning('  - Environment variables');
    if (!results.api) warning('  - Expense API (start the API server)');
    if (!results.startup) warning('  - MCP server startup');
    info('');
    info('Please fix the issues above and run this diagnostic again');
  }

  log('', 'reset');
  log('═'.repeat(60), 'blue');
  log('', 'reset');

  process.exit(allPassed ? 0 : 1);
}

// Run diagnostics
runAllDiagnostics().catch((err) => {
  error(`Diagnostic failed with error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
