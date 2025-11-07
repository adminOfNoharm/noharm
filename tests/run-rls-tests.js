// RLS Test Runner
//
// This script is a simple wrapper to run the RLS tests.
// It can be run from the project root without having to cd into the tests directory.
// 
// Usage:
//   node tests/run-rls-tests.js [suite]
// 
// Arguments:
//   suite - Optional. Specific test suite to run: auth, user, admin, storage, edge
//           If not provided, all tests will run.

const path = require('path');
const { runAllTests, runTestSuite } = require('./rls/run-tests');
const authTests = require('./rls/auth-tests');
const userDataTests = require('./rls/user-data-tests');
const adminTests = require('./rls/admin-tests');
const storageTests = require('./rls/storage-tests');
const edgeCaseTests = require('./rls/edge-case-tests');

// Get test suite argument
const testSuite = process.argv[2];

async function main() {
  console.log('📋 Supabase RLS Test Runner');
  console.log('-'.repeat(50));
  
  try {
    if (testSuite) {
      let testFunction;
      let testName;
      
      // Determine which test to run
      switch (testSuite.toLowerCase()) {
        case 'auth':
          testFunction = authTests;
          testName = 'Authentication Tests';
          break;
        case 'user':
          testFunction = userDataTests;
          testName = 'User Data Access Tests';
          break;
        case 'admin':
          testFunction = adminTests;
          testName = 'Admin User Access Tests';
          break;
        case 'storage':
          testFunction = storageTests;
          testName = 'Storage Access Tests';
          break;
        case 'edge':
          testFunction = edgeCaseTests;
          testName = 'Edge Case Tests';
          break;
        default:
          console.error(`Unknown test suite: ${testSuite}`);
          console.error('Available test suites: auth, user, admin, storage, edge');
          process.exit(1);
      }
      
      // Run the specified test
      await runTestSuite(testName, testFunction);
    } else {
      // Run all tests
      await runAllTests();
    }
  } catch (error) {
    console.error('Error running tests:', error.message);
    process.exit(1);
  }
}

// Run the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 
