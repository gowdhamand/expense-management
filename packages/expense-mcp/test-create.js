#!/usr/bin/env node

/**
 * Test script for create_expense functionality
 *
 * This script tests the create_expense tool by simulating
 * what Claude Desktop would send to the MCP server.
 *
 * Run with: node test-create.js
 */

import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

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

function section(title) {
  console.log('');
  log(`${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
  console.log('');
}

async function testCreateExpense() {
  section('Testing create_expense Tool');

  const distPath = resolve(__dirname, 'dist', 'index.js');

  log('Starting MCP server...', 'cyan');

  const serverProcess = spawn('node', [distPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let messageId = 1;

  // Helper function to send JSON-RPC request
  function sendRequest(method, params = {}) {
    const request = {
      jsonrpc: '2.0',
      id: messageId++,
      method: method,
      params: params,
    };
    const requestStr = JSON.stringify(request) + '\n';
    log(`\nSending: ${method}`, 'cyan');
    log(JSON.stringify(request, null, 2), 'reset');
    serverProcess.stdin.write(requestStr);
  }

  let responses = [];
  let buffer = '';

  serverProcess.stdout.on('data', (data) => {
    buffer += data.toString();

    // Try to parse complete JSON objects from buffer
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim()) {
        try {
          const response = JSON.parse(line);
          responses.push(response);
          log('\nReceived response:', 'green');
          log(JSON.stringify(response, null, 2), 'reset');
        } catch (e) {
          // Not valid JSON, might be partial
        }
      }
    }
  });

  serverProcess.stderr.on('data', (data) => {
    const message = data.toString();
    if (message.includes('[DEBUG]') || message.includes('[ERROR]')) {
      log(message.trim(), 'yellow');
    }
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 1: Initialize
  log('\n--- Step 1: Initialize Connection ---', 'blue');
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0',
    },
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 2: List tools
  log('\n--- Step 2: List Available Tools ---', 'blue');
  sendRequest('tools/list', {});

  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 3: Test create_expense with valid data
  log('\n--- Step 3: Call create_expense Tool ---', 'blue');

  const testExpense = {
    amount: 49.99,
    description: 'Test expense from test script',
    category: 'testing',
    paymentMethod: 'credit card',
    expenseDate: '2024-01-15',
    userName: 'test_user',
  };

  log('Test expense data:', 'cyan');
  log(JSON.stringify(testExpense, null, 2), 'reset');

  sendRequest('tools/call', {
    name: 'create_expense',
    arguments: testExpense,
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 4: Try with missing field (should fail validation)
  log('\n--- Step 4: Test with Missing Field (Should Fail) ---', 'blue');

  const invalidExpense = {
    amount: 25.50,
    description: 'Invalid expense - missing fields',
    category: 'testing',
    // Missing paymentMethod, expenseDate, userName
  };

  log('Invalid expense data (missing fields):', 'cyan');
  log(JSON.stringify(invalidExpense, null, 2), 'reset');

  sendRequest('tools/call', {
    name: 'create_expense',
    arguments: invalidExpense,
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 5: Summary
  section('Test Summary');

  const createResponses = responses.filter(r =>
    r.result && r.result.content &&
    r.result.content[0] &&
    r.result.content[0].text &&
    r.result.content[0].text.includes('Expense')
  );

  if (createResponses.length > 0) {
    log('✅ create_expense tool responded', 'green');

    const successResponse = createResponses.find(r =>
      r.result.content[0].text.includes('Created Successfully')
    );

    if (successResponse) {
      log('✅ Expense created successfully', 'green');
    } else {
      log('⚠️  create_expense responded but may have had errors', 'yellow');
    }
  } else {
    log('❌ create_expense tool did not respond properly', 'red');
  }

  log('\nAll responses received:', 'cyan');
  log(JSON.stringify(responses, null, 2), 'reset');

  // Cleanup
  serverProcess.kill();

  log('\n' + '='.repeat(60), 'blue');
  log('Test completed!', 'blue');
  log('='.repeat(60) + '\n', 'blue');

  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Test failed with error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

// Run test
testCreateExpense().catch((error) => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
