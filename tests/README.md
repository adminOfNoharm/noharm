# Supabase RLS Tests

This directory contains tests to verify the Row Level Security (RLS) policies in your Supabase database.

## Setup

Make sure your `.env` file in the project root contains:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Running Tests

From the project root, run:

```bash
# Run all tests
npm run test:rls

# Run specific test suite
npm run test:rls:auth
npm run test:rls:user
npm run test:rls:admin  
npm run test:rls:storage
npm run test:rls:edge
```

## Test Descriptions

1. **Authentication Tests** (`auth`): Verify login, registration, and session management.
   - These require minimal database setup.

2. **User Data Access Tests** (`user`): Verify regular users can only access their own data.
   - Requires `seller_compound_data` and other tables.

3. **Admin Access Tests** (`admin`): Verify admin users can access all data.
   - Tests that admin role has elevated privileges.

4. **Storage Tests** (`storage`): Verify storage bucket access follows RLS rules.
   - Requires properly configured storage buckets.

5. **Edge Cases** (`edge`): Test error handling and edge cases.
   - Tests behavior with non-existent data, invalid tokens, etc.

## Test Users

The tests create two test users in your Supabase instance:
- Admin user: `admin-test@example.com`
- Regular user: `user-test@example.com`

These test users persist between test runs. 