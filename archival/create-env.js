
const fs = require('fs');
const path = require('path');

console.log('--- Starting create-env.js script ---');

// Vercel environment variables are automatically available in the build process
const isProduction = process.env.VERCEL_ENV === 'production';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;

// --- Debug Logging ---
console.log(`Is production build (VERCEL_ENV=production): ${isProduction}`);

if (supabaseUrl) {
  console.log(`Found SUPABASE_URL: ${supabaseUrl}`);
} else {
  console.error('Error: SUPABASE_URL environment variable not found!');
}

if (supabaseKey) {
  // Log only a non-sensitive part of the key for verification
  console.log(`Found SUPABASE_KEY starting with: '${supabaseKey.substring(0, 5)}...'`);
} else {
  console.error('Error: SUPABASE_KEY environment variable not found!');
}

if (googleBooksApiKey) {
  console.log(`Found GOOGLE_BOOKS_API_KEY.`);
} else {
  console.log('Info: GOOGLE_BOOKS_API_KEY environment variable not found. Skipping.');
}
// --- End Debug Logging ---


const envDir = path.join(__dirname, 'src', 'environments');

// Create the environments directory if it doesn't exist
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Content for environment.ts (development)
const devEnvironmentContent = `
export const environment = {
  production: false,
  supabaseUrl: 'http://localhost:54321',
  supabaseKey: 'your-local-supabase-anon-key',
  googleBooksApiKey: 'your-google-books-api-key'
};
`;

// Content for environment.prod.ts (production)
const prodEnvironmentContent = `
export const environment = {
  production: true,
  supabaseUrl: '${supabaseUrl || ''}',
  supabaseKey: '${supabaseKey || ''}',
  googleBooksApiKey: '${googleBooksApiKey || ''}'
};
`;

try {
  fs.writeFileSync(path.join(envDir, 'environment.ts'), devEnvironmentContent.trim());
  console.log('Successfully created src/environments/environment.ts');

  fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodEnvironmentContent.trim());
  console.log('Successfully created src/environments/environment.prod.ts for production build.');
} catch (error) {
  console.error('Error writing environment files:', error);
  process.exit(1); // Exit with an error code to fail the build
}

console.log('--- Finished create-env.js script ---');
