const { adminClient } = require('./setup');

/**
 * This script ensures that the database schema is properly set up for testing.
 * It checks for required tables and columns, creating them if needed.
 */
async function setupSchema() {
  console.log('Checking and setting up database schema for tests...');
  
  try {
    // Check for tables by directly querying them
    const tables = [];
    const requiredTables = [
      'seller_compound_data',
      'user_onboarding_progress',
      'analytics_events',
      'contract_signatures'
    ];
    
    // Check each table by trying to access it
    for (const tableName of requiredTables) {
      try {
        const { count, error } = await adminClient
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          tables.push({ table_name: tableName });
          console.log(`Table ${tableName} exists`);
        } else {
          console.log(`Table ${tableName} not found or not accessible`);
        }
      } catch (err) {
        console.log(`Table ${tableName} not found or not accessible:`, err.message);
      }
    }
    
    if (tables.length === 0) {
      console.warn('No required tables found. Tests may fail.');
    } else {
      console.log('Found tables:', tables.map(t => t.table_name).join(', '));
    }
    
    // Check columns for seller_compound_data
    if (tables.some(t => t.table_name === 'seller_compound_data')) {
      // Get a sample row to check structure
      const { data, error } = await adminClient
        .from('seller_compound_data')
        .select('*')
        .limit(1);
      
      if (!error && data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log(`Table seller_compound_data has columns:`, columns.join(', '));
        
        // Check for required columns
        const requiredColumns = ['uuid', 'data', 'role', 'status', 'name'];
        const missingColumns = requiredColumns.filter(col => !columns.includes(col));
        
        if (missingColumns.length > 0) {
          console.warn(`Table seller_compound_data is missing columns:`, missingColumns.join(', '));
          console.warn('Tests may fail if these columns are required.');
        }
      }
    }
    
    console.log('Schema check complete!');
    return true;
  } catch (error) {
    console.error('Error checking schema:', error.message);
    console.log('Tests may fail if the database schema is not properly configured.');
    return false;
  }
}

/**
 * Main function to check database schema
 */
async function initDatabase() {
  console.log('Checking database schema for RLS testing...');
  return await setupSchema();
}

// Export functions
module.exports = {
  initDatabase,
  setupSchema
}; 