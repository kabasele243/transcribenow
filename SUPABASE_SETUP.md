# Supabase Integration Setup

This guide will help you integrate Supabase as your database with Clerk authentication.

## Prerequisites

1. A Supabase account and project
2. Your existing Clerk project
3. This codebase

## Step 1: Set up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be ready
3. Go to **Project Settings > API** to get your project URL and anon key

## Step 2: Configure Environment Variables

1. Copy `config/env.example` to `.env.local`
2. Update the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_KEY="your-anon-public-key"
```

## Step 3: Set up Database Schema

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-migration.sql`
4. Run the migration

This will create:
- `folders` table with RLS policies
- `files` table with RLS policies
- Proper indexes for performance
- Foreign key relationships

## Step 4: Configure Clerk Supabase Integration

1. Go to your Clerk dashboard
2. Navigate to **JWT Templates**
3. Create a new JWT template for Supabase
4. Set the template to:
   ```json
   {
     "role": "authenticated",
     "sub": "{{user.id}}"
   }
   ```
5. Copy the JWT secret from your Supabase project settings
6. Paste it into the Clerk JWT template configuration

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Sign in with Clerk
3. Test creating folders and files
4. Verify that data is properly isolated per user

## Migration Complete ✅

Prisma has been completely removed from the project. The application now uses:

- **Supabase** for all database operations
- **Clerk** for authentication
- **Row Level Security (RLS)** for automatic user data isolation
- **Server Actions** for server-side database operations
- **Client-side Supabase client** for real-time updates

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Make sure the JWT template is properly configured in Clerk
2. **Authentication Errors**: Verify your Supabase URL and key are correct
3. **Permission Denied**: Check that RLS policies are enabled and properly configured

### Debugging

- Check the browser console for client-side errors
- Check the server logs for server-side errors
- Use Supabase dashboard to inspect the database directly

## Benefits of This Integration

1. **Automatic User Isolation**: RLS policies ensure users can only access their own data
2. **Real-time Capabilities**: Supabase provides real-time subscriptions
3. **Built-in Authentication**: Seamless integration with Clerk
4. **Scalability**: Supabase handles database scaling automatically
5. **Type Safety**: Full TypeScript support with generated types
6. **Simplified Architecture**: One database solution instead of multiple tools

## Next Steps

1. Consider adding real-time subscriptions for live updates
2. Implement file upload to Supabase Storage
3. Add database backups and monitoring
4. Set up production environment variables 