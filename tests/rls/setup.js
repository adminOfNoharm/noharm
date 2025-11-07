const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Supabase client configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log configuration for debugging
console.log('Supabase URL available:', !!SUPABASE_URL);
console.log('Supabase anon key available:', !!SUPABASE_ANON_KEY);
console.log('Supabase service key available:', !!SUPABASE_SERVICE_KEY);

// Create clients
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test users (to be created or used)
const TEST_USERS = {
  admin: {
    email: 'admin-test@example.com',
    password: 'Admin123!',
    role: 'admin'
  },
  regular: {
    email: 'user-test@example.com',
    password: 'User123!',
    role: 'seller'
  }
};

// Check if a table exists
async function tableExists(tableName) {
  try {
    // Direct query to check table existence
    const { data, error } = await adminClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (error) {
      // Fallback: if table doesn't exist, try a simple select to check
      try {
        const { count, error: selectError } = await adminClient
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        return !selectError;
      } catch (selectError) {
        return false;
      }
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.warn(`Error checking if table ${tableName} exists:`, error.message);
    
    // Try direct query on the table as fallback
    try {
      const { count } = await adminClient
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      return true; // If we got here without error, table exists
    } catch {
      return false;
    }
  }
}

// Utility function to create test users using service role client
async function setupTestUsers() {
  console.log('Setting up test users...');
  
  const users = {};
  
  // First try to just get the existing users by fetching them
  try {
    // Get all users (limited to 100)
    const { data: { users: existingUsers }, error: listError } = await adminClient.auth.admin.listUsers({
      perPage: 100
    });
    
    if (listError) {
      console.warn('Warning: Could not list users:', listError.message);
    } else {
      // Find the admin user
      const adminUser = existingUsers.find(u => u.email === TEST_USERS.admin.email);
      if (adminUser) {
        users.admin = { id: adminUser.id, ...TEST_USERS.admin };
        console.log('Found existing admin user:', adminUser.id);
      }
      
      // Find the regular user
      const regularUser = existingUsers.find(u => u.email === TEST_USERS.regular.email);
      if (regularUser) {
        users.regular = { id: regularUser.id, ...TEST_USERS.regular };
        console.log('Found existing regular user:', regularUser.id);
      }
    }
  } catch (error) {
    console.warn('Warning: Could not get existing users:', error.message);
  }
  
  // Create admin user if it doesn't exist yet
  if (!users.admin) {
    try {
      // Create admin user if doesn't exist
      const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
        email_confirm: true
      });
      
      if (adminError && adminError.message !== 'User already registered') {
        console.error('Error creating admin user:', adminError.message);
      } else {
        const adminId = adminData?.user?.id;
        if (adminId) {
          users.admin = { id: adminId, ...TEST_USERS.admin };
          console.log('Created admin user:', adminId);
        }
      }
    } catch (error) {
      console.error('Error setting up admin user:', error.message);
    }
  }
  
  // Create regular user if it doesn't exist yet
  if (!users.regular) {
    try {
      // Create regular user if doesn't exist
      const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
        email: TEST_USERS.regular.email,
        password: TEST_USERS.regular.password,
        email_confirm: true
      });
      
      if (userError && userError.message !== 'User already registered') {
        console.error('Error creating regular user:', userError.message);
      } else {
        const userId = userData?.user?.id;
        if (userId) {
          users.regular = { id: userId, ...TEST_USERS.regular };
          console.log('Created regular user:', userId);
        }
      }
    } catch (error) {
      console.error('Error setting up regular user:', error.message);
    }
  }
  
  // If we have both users, try to ensure they have data in seller_compound_data
  if (users.admin?.id && users.regular?.id) {
    console.log('Users ready, updating their data...');
    
    // Check if seller_compound_data table exists
    const hasTable = await tableExists('seller_compound_data');
    
    if (hasTable) {
      // Update admin user in seller_compound_data
      try {
        const { error: adminRoleError } = await adminClient
          .from('seller_compound_data')
          .upsert({
            uuid: users.admin.id,
            role: TEST_USERS.admin.role,
            data: { email: TEST_USERS.admin.email },
            name: 'Admin Test User'
          });
        
        if (adminRoleError) console.warn('Warning:', adminRoleError.message);
      } catch (error) {
        console.warn('Could not set admin role in seller_compound_data:', error.message);
      }
      
      // Update regular user in seller_compound_data
      try {
        const { error: userRoleError } = await adminClient
          .from('seller_compound_data')
          .upsert({
            uuid: users.regular.id,
            role: TEST_USERS.regular.role,
            data: { email: TEST_USERS.regular.email },
            name: 'Regular Test User'
          });
        
        if (userRoleError) console.warn('Warning:', userRoleError.message);
      } catch (error) {
        console.warn('Could not set user role in seller_compound_data:', error.message);
      }
    } else {
      console.warn('seller_compound_data table not found, skipping role assignment');
    }
  }
  
  return users;
}

// Helper function to create authenticated client
async function getAuthenticatedClient(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error } = await client.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw new Error(`Authentication error: ${error.message}`);
  }
  
  return client;
}

module.exports = {
  anonClient,
  adminClient,
  TEST_USERS,
  setupTestUsers,
  getAuthenticatedClient,
  tableExists
}; 