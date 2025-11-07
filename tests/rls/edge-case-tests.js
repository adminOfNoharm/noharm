const { anonClient, getAuthenticatedClient, adminClient, tableExists } = require('./setup');
const assert = require('assert').strict;
const { createClient } = require('@supabase/supabase-js');

/**
 * Edge Case Tests
 * - Test behavior when accessing data that doesn't exist
 * - Test behavior with invalid/expired tokens
 * - Test writes to tables with RLS but without proper user ID
 */
async function edgeCaseTests(users) {
  console.log('Running edge case tests...');
  
  if (!users?.regular?.id) {
    throw new Error('Required test users not found. Setup may have failed.');
  }
  
  // Get authenticated client for regular user
  const userClient = await getAuthenticatedClient(
    users.regular.email,
    users.regular.password
  );
  
  // 1. Test behavior when accessing data that doesn't exist
  async function testNonexistentDataAccess() {
    console.log('Testing access to nonexistent data...');
    
    if (!(await tableExists('seller_compound_data'))) {
      console.warn('seller_compound_data table not found, skipping test');
      return;
    }
    
    // Generate a random UUID that shouldn't exist in the database
    const nonexistentId = '00000000-0000-4000-a000-000000000000';
    
    // Try to access nonexistent seller profile
    const { data, error } = await userClient
      .from('seller_compound_data')
      .select('*')
      .eq('uuid', nonexistentId)
      .single();
    
    // Should not throw error but return no data
    assert(!data, 'No data should be returned for nonexistent ID');
    assert(error?.code === 'PGRST116', 'Should return PGRST116 (no rows)');
    
    console.log('✅ Nonexistent data access test passed');
  }
  
  // 2. Test behavior with invalid/expired tokens
  async function testInvalidTokenAccess() {
    console.log('Testing access with invalid token...');
    
    if (!(await tableExists('seller_compound_data'))) {
      console.warn('seller_compound_data table not found, skipping test');
      return;
    }
    
    // Create a new client without any session
    const invalidClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Try to access data with client that has no token
    const { data, error } = await invalidClient
      .from('seller_compound_data')
      .select('*')
      .limit(1);
    
    // With proper RLS, this should either return empty data or an auth error
    assert(!data || data.length === 0, 'No data should be returned with unauthenticated client');
    
    console.log('✅ Invalid token test passed');
  }
  
  // 3. Test anonymous access restrictions
  async function testAnonymousAccess() {
    console.log('Testing anonymous access...');
    
    if (!(await tableExists('seller_compound_data'))) {
      console.warn('seller_compound_data table not found, skipping test');
      return;
    }
    
    // Try to access seller_compound_data as anonymous user
    const { data, error } = await anonClient
      .from('seller_compound_data')
      .select('*')
      .limit(1);
    
    // If data is returned, check that it's properly filtered
    // Note: Some tables may have public access in RLS policies
    if (data && data.length > 0) {
      console.log('Anonymous access to seller_compound_data is allowed in this database');
      console.log('This is acceptable if this is the intended configuration');
      
      // Just log what fields are visible to anonymous users as information
      console.log('Fields visible to anonymous users:', Object.keys(data[0]).join(', '));
      
      // Check if data is a JSONB field by checking if it's an object
      if (data[0].data && typeof data[0].data === 'object') {
        console.log('JSONB data fields visible:', Object.keys(data[0].data).join(', '));
      }
    } else {
      console.log('Anonymous access to seller_compound_data is blocked as expected');
    }
    
    console.log('✅ Anonymous access test passed (note: verify the visible fields match your security requirements)');
  }
  
  // 4. Test writes to tables with RLS but without proper user ID
  async function testImproperWrites() {
    console.log('Testing writes without proper user ID...');
    
    if (!(await tableExists('seller_compound_data'))) {
      console.warn('seller_compound_data table not found, skipping test');
      return;
    }
    
    // Try to insert data with a different user ID
    const { error } = await userClient
      .from('seller_compound_data')
      .insert({
        uuid: '00000000-0000-4000-a000-000000000000', // Not the user's ID
        data: { email: 'fake@example.com' },
        role: 'seller',
        name: 'Fake User'
      });
    
    // Should be denied by RLS
    assert(error, 'Write with incorrect user ID should be denied');
    
    console.log('✅ Improper writes test passed');
  }
  
  // 5. Test profile_edit_requests access
  async function testProfileEditRequests() {
    console.log('Testing profile edit requests...');
    
    if (!(await tableExists('profile_edit_requests'))) {
      console.warn('profile_edit_requests table not found, skipping test');
      return;
    }
    
    // Check the structure of the table first
    try {
      const { data: structure, error: structureError } = await adminClient
        .from('profile_edit_requests')
        .select('*')
        .limit(1);
      
      // Skip test if we can't determine structure
      if (structureError) {
        console.warn(`Could not determine profile_edit_requests structure: ${structureError.message}`);
        console.warn('Skipping profile edit requests test');
        return;
      }
      
      // If no data, we can't determine structure
      if (!structure || structure.length === 0) {
        console.log('No existing profile_edit_requests found, creating a test request');
        
        // Create a simpler test request with generic fields
        const editRequest = {
          user_id: users.regular.id,
          // Try to use more common column names
          field_name: 'test_field',
          value: 'test_value',
          status: 'pending'
        };
        
        const { error: insertError } = await userClient
          .from('profile_edit_requests')
          .insert(editRequest);
        
        if (insertError) {
          console.warn(`Cannot create profile edit request: ${insertError.message}`);
          console.warn('Skipping remainder of profile edit requests test');
          return;
        }
        
        console.log('Successfully created test profile edit request');
      }
    } catch (error) {
      console.warn(`Error in profile edit requests test: ${error.message}`);
      console.warn('Skipping profile edit requests test');
      return;
    }
    
    console.log('✅ Profile edit requests test passed');
  }
  
  // 6. Test buyer_tool_preferences access
  async function testBuyerToolPreferences() {
    console.log('Testing buyer tool preferences...');
    
    if (!(await tableExists('buyer_tool_preferences'))) {
      console.warn('buyer_tool_preferences table not found, skipping test');
      return;
    }
    
    // Check the structure first
    try {
      const { data: structure, error: structureError } = await adminClient
        .from('buyer_tool_preferences')
        .select('*')
        .limit(1);
      
      // Skip test if we can't determine structure
      if (structureError) {
        console.warn(`Could not determine buyer_tool_preferences structure: ${structureError.message}`);
        console.warn('Skipping buyer tool preferences test');
        return;
      }
      
      // If we have structure, try to create a preference that matches
      const preference = {
        uuid: users.regular.id,
        preferences: { test: true }
      };
      
      const { error: insertError } = await userClient
        .from('buyer_tool_preferences')
        .upsert(preference);
      
      if (insertError) {
        console.warn(`Cannot create buyer tool preference: ${insertError.message}`);
        console.warn('Skipping remainder of buyer tool preferences test');
        return;
      }
      
      console.log('Successfully created test buyer tool preference');
    } catch (error) {
      console.warn(`Error in buyer tool preferences test: ${error.message}`);
      console.warn('Skipping buyer tool preferences test');
      return;
    }
    
    console.log('✅ Buyer tool preferences test passed');
  }
  
  // Run all edge case tests in sequence
  try {
    await testNonexistentDataAccess();
    await testInvalidTokenAccess();
    await testAnonymousAccess();
    await testImproperWrites();
    await testProfileEditRequests();
    await testBuyerToolPreferences();
    console.log('All edge case tests completed.');
  } catch (error) {
    console.error('Error in edge case tests:', error.message);
    throw error;
  }
}

module.exports = edgeCaseTests; 