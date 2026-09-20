-- supabase_rls.sql
-- Run this script in the Supabase SQL Editor to enforce baseline security on your tables.

-- 1. Enable RLS on all tables
ALTER TABLE user_loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE composting_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycling_facilities ENABLE ROW LEVEL SECURITY;

-- 2. Policies for user-specific data (user_loops)
CREATE POLICY "Allow users to read their own loops" ON user_loops 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own loops" ON user_loops 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own loops" ON user_loops 
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Policies for user-specific data (chat_messages)
CREATE POLICY "Allow users to read their own chats" ON chat_messages 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own chats" ON chat_messages 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Policies for public reference data (composting_units, etc)
-- These allow anyone (authenticated or anonymous) to SELECT, but implicitly block INSERT/UPDATE/DELETE.
CREATE POLICY "Allow public read on composting_units" ON composting_units 
FOR SELECT USING (true);

CREATE POLICY "Allow public read on plant_knowledge_base" ON plant_knowledge_base 
FOR SELECT USING (true);

CREATE POLICY "Allow public read on recycling_facilities" ON recycling_facilities 
FOR SELECT USING (true);
