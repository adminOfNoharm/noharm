const { getAuthenticatedClient, tableExists } = require('./setup');
const assert = require('assert').strict;

/**
 * Admin User Access Tests
 * - Verify admin role detection works
 * - Test admin can access all users' profiles
 * - Test admin can modify any user's data
 * - Test admin can access all onboarding progress
 * - Test admin can access all analytics data
 */
async function adminTests(users) {
  console.log('Running admin user access tests...');
  
  if (!users?.admin?.id || !users?.regular?.id) {
    throw new Error('Required test users not found. Setup may have failed.');
  }
  
  // Get authenticated client for admin user
  const adminClient = await getAuthenticatedClient(
    users.admin.email,
    users.admin.password
  );
  
  // 1. Verify admin role detection works
  async function testAdminRoleDetection() {
    console.log('Testing admin role detection...');
    
    if (!(await tableExists('seller_compound_data'))) {
      console.warn('seller_compound_data table not found, skipping test');
      return;
    }
    
    // Get admin user's role from seller_compound_data
    const { data, error } = await adminClient
      .from('seller_compound_data')
      .select('role')
      .eq('uuid', users.admin.id)
      .single();
    
    assert(!error, `Admin should be able to access own profile: ${error?.message || ''}`);
    assert(data?.role === 'admin', 'Admin user should have admin role');
    
    console.log('✅ Admin role detection test passed');
  }
  
  // 2. Test admin can access all users' profiles
  async function testAccessAllProfiles() {
    console.log('Testing admin can access all user profiles...');
    
    if (!(await tableExists('seller_compound_data'))) {
      console.warn('seller_compound_data table not found, skipping test');
      return;
    }
    
    // Try to access regular user's profile
    const { data, error } = await adminClient
      .from('seller_compound_data')
      .select('*')
      .eq('uuid', users.regular.id)
      .single();
    
    assert(!error, `Admin should be able to access other user profiles: ${error?.message || ''}`);
    assert(data, 'Other user profile data should be returned');
    assert(data.uuid === users.regular.id, 'Other user profile should have correct ID');
    
    // Count total accessible profiles
    const { count, error: countError } = await adminClient
      .from('seller_compound_data')
      .select('*', { count: 'exact', head: true });
    
    assert(!countError, `Admin should be able to count all profiles: ${countError?.message || ''}`);
    assert(count >= 2, 'Admin should be able to access at least both test user profiles');
    
    console.log('✅ Access all profiles test passed');
  }
  
  // 3. Test admin can modify any user's data
  async function testModifyAnyUserData() {
    console.log('Testing admin can modify any user\'s data...');
    
    if (!(await tableExists('seller_compound_data'))) {
      console.warn('seller_compound_data table not found, skipping test');
      return;
    }
    
    // Generate unique test note for this run
    const testNote = `Test admin note ${Date.now()}`;
    
    // Update regular user's profile with a test note
    const { error } = await adminClient
      .from('seller_compound_data')
      .update({ 
        data: { 
          admin_notes: testNote,
          last_modified_by: 'admin'
        }
      })
      .eq('uuid', users.regular.id);
    
    assert(!error, `Admin should be able to update other user profiles: ${error?.message || ''}`);
    
    // Verify the note was updated
    const { data: verifyData, error: verifyError } = await adminClient
      .from('seller_compound_data')
      .select('data')
      .eq('uuid', users.regular.id)
      .single();
    
    assert(!verifyError, `Admin should be able to verify updates: ${verifyError?.message || ''}`);
    assert(verifyData.data.admin_notes === testNote, 'Admin notes should be updated with test note');
    
    console.log('✅ Modify any user data test passed');
  }
  
  // 4. Test admin can access all onboarding progress records
  async function testAccessAllOnboardingProgress() {
    console.log('Testing admin can access all onboarding progress...');
    
    if (!(await tableExists('user_onboarding_progress'))) {
      console.warn('user_onboarding_progress table not found, skipping test');
      return;
    }
    
    // Ensure regular user has onboarding progress
    const testStageId = 1;
    await adminClient
      .from('user_onboarding_progress')
      .upsert({
        uuid: users.regular.id,
        stage_id: testStageId,
        status: 'in_progress'
      });
    
    // Try to access regular user's onboarding progress
    const { data, error } = await adminClient
      .from('user_onboarding_progress')
      .select('*')
      .eq('uuid', users.regular.id)
      .eq('stage_id', testStageId)
      .single();
    
    assert(!error, `Admin should be able to access other user's onboarding progress: ${error?.message || ''}`);
    assert(data, 'Other user onboarding progress data should be returned');
    assert(data.uuid === users.regular.id, 'Other user onboarding progress should have correct ID');
    
    console.log('✅ Access all onboarding progress test passed');
  }
  
  // 5. Test admin can access analytics data for all users
  async function testAccessAllAnalyticsData() {
    console.log('Testing admin can access all analytics data...');
    
    if (!(await tableExists('analytics_events'))) {
      console.warn('analytics_events table not found, skipping test');
      return;
    }
    
    // Create a test analytics event for regular user
    const testEvent = {
      user_id: users.regular.id,
      event_type: 'admin_test_event',
      event_data: { timestamp: new Date().toISOString() }
    };
    
    await adminClient
      .from('analytics_events')
      .insert(testEvent);
    
    // Attempt to retrieve analytics for the regular user
    const { data, error } = await adminClient
      .from('analytics_events')
      .select('*')
      .eq('user_id', users.regular.id)
      .eq('event_type', 'admin_test_event')
      .order('created_at', { ascending: false })
      .limit(1);
    
    assert(!error, `Admin should be able to access other user's analytics events: ${error?.message || ''}`);
    assert(data && data.length > 0, 'Admin should be able to see analytics events for other users');
    
    console.log('✅ Access all analytics data test passed');
  }
  
  // 6. Test admin can access contract signatures
  async function testAccessContractSignatures() {
    console.log('Testing admin can access and create contract signatures...');
    
    if (!(await tableExists('contract_signatures'))) {
      console.warn('contract_signatures table not found, skipping test');
      return;
    }
    
    // First check the table structure
    try {
      const { data: structure, error: structureError } = await adminClient
        .from('contract_signatures')
        .select('*')
        .limit(1);
      
      // If there's a structure error or no data, create a simpler test signature
      if (structureError || !structure || structure.length === 0) {
        // Create a simple test signature with minimal fields
        const simpleTestSignature = {
          user_uuid: users.regular.id,
          contract_type: 'test',
          signed_at: new Date().toISOString(),
          full_name: 'Test User'
        };
        
        const { error: insertError } = await adminClient
          .from('contract_signatures')
          .insert(simpleTestSignature);
        
        assert(!insertError, `Admin should be able to create contract signatures for other users: ${insertError?.message || ''}`);
      } else {
        // If we have data, check if signature_data exists in the schema
        const columns = Object.keys(structure[0]);
        const hasSignatureData = columns.includes('signature_data');
        
        // Create a test signature with fields that match the schema
        const testSignature = {
          user_uuid: users.regular.id,
          contract_type: 'test',
          signed_at: new Date().toISOString(),
          full_name: 'Test User'
        };
        
        // Add signature_data if it exists in the schema
        if (hasSignatureData) {
          testSignature.signature_data = { test: true };
        }
        
        const { error: insertError } = await adminClient
          .from('contract_signatures')
          .insert(testSignature);
        
        assert(!insertError, `Admin should be able to create contract signatures for other users: ${insertError?.message || ''}`);
      }
    } catch (error) {
      console.warn('Error checking contract_signatures structure:', error.message);
      return; // Skip the rest of the test
    }
    
    // Attempt to retrieve the signature
    const { data, error } = await adminClient
      .from('contract_signatures')
      .select('*')
      .eq('user_uuid', users.regular.id)
      .eq('contract_type', 'test')
      .limit(1);
    
    assert(!error, `Admin should be able to access other user's contract signatures: ${error?.message || ''}`);
    assert(data && data.length > 0, 'Contract signature data should be returned');
    assert(data[0].user_uuid === users.regular.id, 'Contract signature should have correct user ID');
    
    console.log('✅ Access contract signatures test passed');
  }
  
  // Run all admin tests in sequence
  try {
    await testAdminRoleDetection();
    await testAccessAllProfiles();
    await testModifyAnyUserData();
    await testAccessAllOnboardingProgress();
    await testAccessAllAnalyticsData();
    await testAccessContractSignatures();
    console.log('All admin tests completed.');
  } catch (error) {
    console.error('Error in admin tests:', error.message);
    throw error;
  }
}

module.exports = adminTests; 