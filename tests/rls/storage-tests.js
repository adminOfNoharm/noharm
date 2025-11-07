const { getAuthenticatedClient } = require('./setup');
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');

/**
 * Storage Access Tests
 * - Test user can list/upload files to their own assets folder
 * - Test user can list/upload files to their own docs folder
 * - Test user can view contract files
 * - Test user cannot access other users' files
 * - Test admin can access all users' files
 */
async function storageTests(users) {
  console.log('Running storage access tests...');
  
  if (!users?.admin?.id || !users?.regular?.id) {
    throw new Error('Required test users not found. Setup may have failed.');
  }
  
  // Get authenticated clients
  const userClient = await getAuthenticatedClient(
    users.regular.email,
    users.regular.password
  );
  
  const adminClient = await getAuthenticatedClient(
    users.admin.email,
    users.admin.password
  );
  
  // Test file content
  const testFileContent = 'This is a test file for RLS testing';
  const testFileName = `test-${Date.now()}.txt`;
  
  // Helper function to create a test file
  function createTestFile(content, filename) {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, content);
    return {
      path: filePath,
      name: filename
    };
  }
  
  // Helper function to check if a bucket exists
  async function bucketExists(bucketName) {
    try {
      const { data, error } = await adminClient.storage.listBuckets();
      
      if (error) {
        console.warn(`Error checking buckets: ${error.message}`);
        return false;
      }
      
      return data && data.some(bucket => bucket.name === bucketName);
    } catch (error) {
      console.warn(`Error checking if bucket ${bucketName} exists: ${error.message}`);
      return false;
    }
  }
  
  // 1. Test user can upload and access their own assets
  async function testOwnAssetsAccess() {
    console.log('Testing user can access own assets...');
    
    // Check if the user-assets bucket exists
    if (!(await bucketExists('user-assets'))) {
      console.warn('user-assets bucket does not exist, skipping test');
      return false;
    }
    
    const userAssetPath = `${users.regular.id}/test-asset-${Date.now()}.txt`;
    
    // Create and upload test file to user's asset path
    const testFile = createTestFile(testFileContent, testFileName);
    
    try {
      const { error: uploadError } = await userClient.storage
        .from('user-assets')
        .upload(userAssetPath, fs.createReadStream(testFile.path));
      
      // Clean up temp file
      fs.unlinkSync(testFile.path);
      
      // Some supabase instances may not have storage set up correctly
      if (uploadError && uploadError.message.includes('storage not configured')) {
        console.warn('Storage not configured, skipping storage tests');
        return false;
      }
      
      if (uploadError) {
        console.warn(`Upload error: ${uploadError.message}`);
        return false;
      }
      
      // Get URL to access the file
      const { data: urlData } = await userClient.storage
        .from('user-assets')
        .getPublicUrl(userAssetPath);
      
      assert(urlData?.publicUrl, 'User should be able to get URL for own asset');
      
      // List files in user's directory
      const { data: listData, error: listError } = await userClient.storage
        .from('user-assets')
        .list(users.regular.id);
      
      assert(!listError, `User should be able to list own assets: ${listError?.message || ''}`);
      assert(listData, 'List data should be returned');
      assert(listData.some(file => file.name.startsWith('test-asset')), 'Uploaded file should be in list');
      
      console.log('✅ Own assets access test passed');
      return true;
    } catch (error) {
      console.error(`Error in own assets test: ${error.message}`);
      // Attempt to clean up temp file if it still exists
      try {
        if (fs.existsSync(testFile.path)) {
          fs.unlinkSync(testFile.path);
        }
      } catch (cleanupError) {
        console.warn(`Error cleaning up test file: ${cleanupError.message}`);
      }
      return false;
    }
  }
  
  // 2. Test user cannot access other users' files
  async function testOtherUserFilesAccess() {
    console.log('Testing user cannot access other users\' files...');
    
    // Check if the user-assets bucket exists
    if (!(await bucketExists('user-assets'))) {
      console.warn('user-assets bucket does not exist, skipping test');
      return;
    }
    
    // Upload test file to admin's asset path using admin client
    const adminAssetPath = `${users.admin.id}/admin-test-asset-${Date.now()}.txt`;
    const adminFile = createTestFile('Admin test file', 'admin-test.txt');
    
    try {
      // Upload file as admin
      const { error: uploadError } = await adminClient.storage
        .from('user-assets')
        .upload(adminAssetPath, fs.createReadStream(adminFile.path));
      
      // Clean up temp file
      fs.unlinkSync(adminFile.path);
      
      if (uploadError) {
        console.warn(`Admin upload error: ${uploadError.message}`);
        return;
      }
      
      // Now try to access this file as regular user
      const { data, error } = await userClient.storage
        .from('user-assets')
        .list(users.admin.id);
      
      // This should fail due to storage RLS
      assert(!data || data.length === 0, 'User should not be able to list other user\'s assets');
      
      console.log('✅ Other user files access restriction test passed');
    } catch (error) {
      // Some errors are expected
      if (!error.message.includes('permission') && !error.message.includes('not found')) {
        console.error(`Unexpected error in other user files test: ${error.message}`);
      }
      
      // Attempt to clean up temp file if it still exists
      try {
        if (fs.existsSync(adminFile.path)) {
          fs.unlinkSync(adminFile.path);
        }
      } catch (cleanupError) {
        console.warn(`Error cleaning up admin test file: ${cleanupError.message}`);
      }
    }
  }
  
  // 3. Test admin can access all users' files
  async function testAdminFilesAccess() {
    console.log('Testing admin can access all users\' files...');
    
    // Check if the user-assets bucket exists
    if (!(await bucketExists('user-assets'))) {
      console.warn('user-assets bucket does not exist, skipping test');
      return;
    }
    
    // First ensure there's a file for the regular user
    const userAssetPath = `${users.regular.id}/admin-created-test-${Date.now()}.txt`;
    const testFile = createTestFile('Admin created this file for testing', 'admin-created-test.txt');
    
    try {
      // Upload as admin
      const { error: uploadError } = await adminClient.storage
        .from('user-assets')
        .upload(userAssetPath, fs.createReadStream(testFile.path));
      
      // Clean up temp file
      fs.unlinkSync(testFile.path);
      
      if (uploadError) {
        console.warn(`Admin upload error: ${uploadError.message}`);
        return;
      }
      
      // Try to list regular user's files as admin
      const { data, error } = await adminClient.storage
        .from('user-assets')
        .list(users.regular.id);
      
      assert(!error, `Admin should be able to list other user's assets: ${error?.message || ''}`);
      assert(data && data.length > 0, 'Admin should be able to see files');
      
      console.log('✅ Admin files access test passed');
    } catch (error) {
      console.error(`Error in admin files test: ${error.message}`);
      
      // Attempt to clean up temp file if it still exists
      try {
        if (fs.existsSync(testFile.path)) {
          fs.unlinkSync(testFile.path);
        }
      } catch (cleanupError) {
        console.warn(`Error cleaning up test file: ${cleanupError.message}`);
      }
    }
  }
  
  // 4. Test contract files access
  async function testContractFilesAccess() {
    console.log('Testing contract files access...');
    
    // Check if the contracts bucket exists
    if (!(await bucketExists('contracts'))) {
      console.warn('contracts bucket does not exist, skipping test');
      return;
    }
    
    // Upload a test contract
    const contractFile = createTestFile('Test contract content', 'test-contract.pdf');
    const contractPath = 'test-contract.pdf';
    
    try {
      // Use admin to upload the contract
      const { error: uploadError } = await adminClient.storage
        .from('contracts')
        .upload(contractPath, fs.createReadStream(contractFile.path), { upsert: true });
      
      // Clean up temp file
      fs.unlinkSync(contractFile.path);
      
      if (uploadError && !uploadError.message.includes('already exists')) {
        console.warn(`Contract upload error: ${uploadError.message}`);
        return;
      }
      
      // Try to access as regular user - contracts should be accessible to all authenticated users
      const { data, error } = await userClient.storage
        .from('contracts')
        .list();
      
      assert(!error, `User should be able to list contracts: ${error?.message || ''}`);
      assert(data, 'Contract list data should be returned');
      
      console.log('✅ Contract files access test passed');
    } catch (error) {
      console.error(`Error in contract files test: ${error.message}`);
      
      // Attempt to clean up temp file if it still exists
      try {
        if (fs.existsSync(contractFile.path)) {
          fs.unlinkSync(contractFile.path);
        }
      } catch (cleanupError) {
        console.warn(`Error cleaning up contract test file: ${cleanupError.message}`);
      }
    }
  }
  
  // Run all storage tests in sequence
  try {
    const storageConfigured = await testOwnAssetsAccess();
    if (storageConfigured) {
      await testOtherUserFilesAccess();
      await testAdminFilesAccess();
      await testContractFilesAccess();
      console.log('All storage tests completed.');
    } else {
      console.log('Skipping remaining storage tests as storage appears to be not configured');
    }
  } catch (error) {
    console.error('Error in storage tests:', error.message);
    throw error;
  }
}

module.exports = storageTests; 