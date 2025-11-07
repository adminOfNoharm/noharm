const { anonClient, TEST_USERS, getAuthenticatedClient } = require('./setup');
const { createClient } = require('@supabase/supabase-js');
const assert = require('assert').strict;

// Supabase client configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Authentication Tests
 * - Test login with public anon key
 * - Test registration with public anon key
 * - Test session retrieval
 * - Test logout
 */
async function authTests(users) {
  console.log('Running authentication tests...');
  
  // Test variables
  const tempEmail = `temp-${Date.now()}@example.com`;
  const tempPassword = 'Temp123!';
  let tempUserId = null;
  
  // 1. Test login with public anon key
  async function testLogin() {
    console.log('Testing login with existing user...');
    
    // Try to login with regular user
    const client = await getAuthenticatedClient(
      TEST_USERS.regular.email,
      TEST_USERS.regular.password
    );
    
    // Verify session exists
    const { data: { session } } = await client.auth.getSession();
    assert(session, 'Session should exist after login');
    assert(session.user.email === TEST_USERS.regular.email, 'Session should contain correct user email');
    
    console.log('✅ Login test passed');
  }
  
  // 2. Test registration with public anon key
  async function testRegistration() {
    console.log('Testing registration of new user...');
    
    // Sign up new temp user
    const { data, error } = await anonClient.auth.signUp({
      email: tempEmail,
      password: tempPassword
    });
    
    assert(!error, `Registration should succeed: ${error?.message || ''}`);
    assert(data.user, 'Registration should return user data');
    tempUserId = data.user.id;
    
    console.log('✅ Registration test passed');
    
    // Add temp user to seller_compound_data (needed for subsequent tests)
    try {
      // Create authenticated client to insert own data (this tests RLS policy for INSERT)
      const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      await tempClient.auth.signInWithPassword({
        email: tempEmail,
        password: tempPassword
      });
      
      // Insert data using the logged-in client
      const { error: insertError } = await tempClient
        .from('seller_compound_data')
        .insert({
          uuid: tempUserId,
          data: { email: tempEmail },
          role: 'seller',
          name: 'Temporary Test User'
        });
      
      if (insertError) {
        console.warn('Warning: Could not add temp user to seller_compound_data table:', insertError.message);
      }
    } catch (err) {
      console.warn('Warning: Could not set up temporary user completely:', err.message);
    }
  }
  
  // 3. Test session retrieval
  async function testSessionRetrieval() {
    console.log('Testing session retrieval...');
    
    // Create authenticated client
    const client = await getAuthenticatedClient(
      TEST_USERS.regular.email,
      TEST_USERS.regular.password
    );
    
    // Get session
    const { data: { session }, error } = await client.auth.getSession();
    
    assert(!error, `Session retrieval should succeed: ${error?.message || ''}`);
    assert(session, 'Session should exist');
    assert(session.user.id, 'Session should include user ID');
    
    console.log('✅ Session retrieval test passed');
  }
  
  // 4. Test logout
  async function testLogout() {
    console.log('Testing logout...');
    
    // Create authenticated client
    const client = await getAuthenticatedClient(
      TEST_USERS.regular.email,
      TEST_USERS.regular.password
    );
    
    // Verify session exists
    const { data: { session: initialSession } } = await client.auth.getSession();
    assert(initialSession, 'Session should exist before logout');
    
    // Logout
    const { error } = await client.auth.signOut();
    assert(!error, `Logout should succeed: ${error?.message || ''}`);
    
    // Verify session is gone
    const { data: { session: afterSession } } = await client.auth.getSession();
    assert(!afterSession, 'Session should be null after logout');
    
    console.log('✅ Logout test passed');
  }
  
  // Run all auth tests in sequence
  await testLogin();
  await testRegistration();
  await testSessionRetrieval();
  await testLogout();
}

module.exports = authTests; 