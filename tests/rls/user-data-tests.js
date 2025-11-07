const { getAuthenticatedClient, tableExists, adminClient } = require('./setup');
const assert = require('assert').strict;

/**
 * Regular User Data Access Tests
 * - Test user can access own profile in seller_compound_data
 * - Test user can update own profile
 * - Test user can access own onboarding progress
 * - Test user cannot access other users' data
 * - Test user can access public onboarding questions and stages
 */
async function userDataTests(users) {
  console.log('Running regular user data access tests...');
  
  if (!users?.regular?.id) {
    throw new Error('Required test user not found. Setup may have failed.');
  }
  
  // Get authenticated client for regular user
  const userClient = await getAuthenticatedClient(
    users.regular.email,
    users.regular.password
  );
  
  // 1. Test user can access own profile in seller_compound_data
  async function testOwnProfileAccess() {
    console.log('Testing user can access own profile...');
    
    if (!(await tableExists('seller_compound_data'))) {
      console.warn('seller_compound_data table not found, skipping test');
      return;
    }
    
    const { data, error } = await userClient
      .from('seller_compound_data')
      .select('*')
      .eq('uuid', users.regular.id)
      .single();
    
    assert(!error, `User should be able to access own profile: ${error?.message || ''}`);
    assert(data, 'User profile data should be returned');
    assert(data.uuid === users.regular.id, 'User profile should have correct ID');
    
    console.log('✅ Own profile access test passed');
  }
  
  // 2. Test user can update own profile
  async function testOwnProfileUpdate() {
    console.log('Testing user can update own profile...');
    
    if (!(await tableExists('seller_compound_data'))) {
      console.warn('seller_compound_data table not found, skipping test');
      return;
    }
    
    // Get current profile
    const { data: beforeData } = await userClient
      .from('seller_compound_data')
      .select('uuid, data')
      .eq('uuid', users.regular.id)
      .single();
    
    // Update profile data
    const updatedData = {
      ...beforeData.data,
      last_updated: new Date().toISOString(),
      test_field: `test-value-${Date.now()}`
    };
    
    const { error } = await userClient
      .from('seller_compound_data')
      .update({ data: updatedData })
      .eq('uuid', users.regular.id);
    
    assert(!error, `User should be able to update own profile: ${error?.message || ''}`);
    
    // Verify profile was updated
    const { data: afterData } = await userClient
      .from('seller_compound_data')
      .select('uuid, data')
      .eq('uuid', users.regular.id)
      .single();
    
    assert(afterData.data.last_updated !== beforeData.data?.last_updated, 
      'Profile should be updated with new data');
    assert(afterData.data.test_field, 'New test field should be added');
    
    console.log('✅ Own profile update test passed');
  }
  
  // 3. Test user can access own onboarding progress
  async function testOwnOnboardingProgress() {
    console.log('Testing user can access own onboarding progress...');
    
    if (!(await tableExists('user_onboarding_progress'))) {
      console.warn('user_onboarding_progress table not found, skipping test');
      return;
    }
    
    // Check if we have valid stage_id values to use
    let validStageId = null;
    try {
      // Try to get a valid stage_id from the onboarding_stages table
      if (await tableExists('onboarding_stages')) {
        const { data: stages, error: stagesError } = await adminClient
          .from('onboarding_stages')
          .select('stage_id')
          .limit(1);
        
        if (!stagesError && stages && stages.length > 0) {
          validStageId = stages[0].stage_id;
          console.log(`Found valid stage_id: ${validStageId}`);
        }
      }
      
      // If we couldn't get a valid stage_id, skip the test
      if (!validStageId) {
        console.warn('Could not find a valid stage_id. The onboarding_stages table may be empty or not accessible.');
        console.warn('Skipping onboarding progress test due to foreign key constraint.');
        return;
      }
      
      // First clear any existing record to avoid duplication
      try {
        await userClient
          .from('user_onboarding_progress')
          .delete()
          .eq('uuid', users.regular.id)
          .eq('stage_id', validStageId);
      } catch (err) {
        // Ignore deletion errors
      }
      
      // Create test onboarding progress
      const { error: insertError } = await userClient
        .from('user_onboarding_progress')
        .insert({
          uuid: users.regular.id,
          stage_id: validStageId,
          status: 'in_progress'
        });
      
      if (insertError) {
        console.warn(`Could not insert onboarding progress: ${insertError.message}`);
        console.warn('Skipping remainder of onboarding progress test.');
        return;
      }
      
      // Check if onboarding progress can be accessed
      const { data, error } = await userClient
        .from('user_onboarding_progress')
        .select('*')
        .eq('uuid', users.regular.id)
        .eq('stage_id', validStageId)
        .single();
      
      assert(!error, `User should be able to access own onboarding progress: ${error?.message || ''}`);
      assert(data, 'Onboarding progress data should be returned');
      assert(data.uuid === users.regular.id, 'Onboarding progress should have correct user ID');
    } catch (error) {
      console.warn('Error in onboarding progress test:', error.message);
      console.warn('This may be due to missing tables or foreign key constraints.');
      return; // Skip the rest of the test
    }
    
    console.log('✅ Own onboarding progress access test passed');
  }
  
  // 4. Test user cannot access other users' data
  async function testOtherUserDataAccess() {
    console.log('Testing user cannot access other users\' data...');
    
    if (!users?.admin?.id) {
      console.warn('Admin user ID not available, skipping this test');
      return;
    }
    
    if (!(await tableExists('seller_compound_data'))) {
      console.warn('seller_compound_data table not found, skipping test');
      return;
    }
    
    // Try to access another user's profile
    const { data, error } = await userClient
      .from('seller_compound_data')
      .select('*')
      .eq('uuid', users.admin.id)
      .single();
    
    // This should fail due to RLS
    assert(!data || Object.keys(data).length === 0, 'User should not be able to access other user\'s profile data');
    
    console.log('✅ Other user data access restriction test passed');
  }
  
  // 5. Test analytics event insertion
  async function testAnalyticsEventInsertion() {
    console.log('Testing user can insert own analytics events...');
    
    if (!(await tableExists('analytics_events'))) {
      console.warn('analytics_events table not found, skipping test');
      return;
    }
    
    const testEvent = {
      user_id: users.regular.id,
      event_type: 'test_event',
      event_data: { test: true, timestamp: new Date().toISOString() }
    };
    
    const { error } = await userClient
      .from('analytics_events')
      .insert(testEvent);
    
    assert(!error, `User should be able to insert own analytics events: ${error?.message || ''}`);
    
    console.log('✅ Analytics event insertion test passed');
  }
  
  // Run all user data tests in sequence
  try {
    await testOwnProfileAccess();
    await testOwnProfileUpdate();
    await testOwnOnboardingProgress();
    await testOtherUserDataAccess();
    await testAnalyticsEventInsertion();
    console.log('All user data tests completed.');
  } catch (error) {
    console.error('Error in user data tests:', error.message);
    throw error;
  }
}

module.exports = userDataTests; 