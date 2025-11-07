const { setupTestUsers } = require('./setup');
const { initDatabase } = require('./schema-setup');
const authTests = require('./auth-tests');
const userDataTests = require('./user-data-tests');
const adminTests = require('./admin-tests');
const storageTests = require('./storage-tests');
const edgeCaseTests = require('./edge-case-tests');

// Helper to run tests with nice formatting
async function runTestSuite(name, testFn, users = null) {
  console.log(`\n\n${'-'.repeat(50)}`);
  console.log(`🧪 RUNNING TEST SUITE: ${name}`);
  console.log(`${'-'.repeat(50)}\n`);
  
  // If users aren't provided, set them up
  const usersToUse = users || await setupTestUsers();
  
  try {
    await testFn(usersToUse);
    console.log(`\n✅ TEST SUITE PASSED: ${name}\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ TEST SUITE FAILED: ${name}`);
    console.error(`Error: ${error.message}`);
    if (error.stack) console.error(error.stack);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 STARTING RLS POLICY TESTS\n');
  
  try {
    // Initialize database schema if needed
    await initDatabase();
    
    // Setup test users first
    const users = await setupTestUsers();
    
    // Track results
    const results = {
      auth: await runTestSuite('Authentication Tests', authTests, users),
      userData: await runTestSuite('User Data Access Tests', userDataTests, users),
      admin: await runTestSuite('Admin User Access Tests', adminTests, users),
      storage: await runTestSuite('Storage Access Tests', storageTests, users),
      edgeCases: await runTestSuite('Edge Case Tests', edgeCaseTests, users)
    };
    
    // Print summary
    console.log('\n\n📊 TEST RESULTS SUMMARY:');
    console.log('-'.repeat(50));
    Object.entries(results).forEach(([suite, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${suite.padEnd(15)}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result === true);
    
    console.log('-'.repeat(50));
    console.log(`OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return allPassed;
  } catch (error) {
    console.error('❌ ERROR RUNNING TESTS:', error);
    return false;
  }
}

// Run if directly executed
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unhandled error in test execution:', err);
      process.exit(1);
    });
}

module.exports = { runAllTests, runTestSuite }; 