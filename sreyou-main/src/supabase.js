import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkeyyjmupssazgterrut.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZXl5am11cHNzYXpndGVycnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MTg2NTEsImV4cCI6MjA5MTQ5NDY1MX0.N5MKRGSwHe_3qLoQJ0AQ56K7Rbvrk_iAsOZY9Cd4R6I';

export const supabase = createClient(supabaseUrl, supabaseKey);
