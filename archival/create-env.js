
const fs = require('fs');
const path = require('path');

// Vercel environment variables are automatically available in the build process
const isProduction = process.env.VERCEL_ENV === 'production';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;

const envDir = path.join(__dirname, 'src', 'environments');

// Create the environments directory if it doesn't exist
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Content for environment.ts (development)
// These values are placeholders for local development and will be ignored by Git.
const devEnvironmentContent = `
export const environment = {
  production: false,
  supabaseUrl: 'http://localhost:54321', // Your local Supabase URL
  supabaseKey: 'your-local-supabase-anon-key', // Your local Supabase anon key
  googleBooksApiKey: 'your-google-books-api-key' // Your local Google Books API key
};
`;

// Content for environment.prod.ts (production)
// These values are dynamically inserted from Vercel's environment variables.
const prodEnvironmentContent = `
export const environment = {
  production: true,
  supabaseUrl: '${supabaseUrl || ''}',
  supabaseKey: '${supabaseKey || ''}',
  googleBooksApiKey: '${googleBooksApiKey || ''}'
};
`;

// Write the environment.ts file for local development.
// This file is in .gitignore, so this script running on Vercel won't create it in the git history.
fs.writeFileSync(path.join(envDir, 'environment.ts'), devEnvironmentContent.trim());
console.log('Successfully created src/environments/environment.ts');

// Write the environment.prod.ts file for the Vercel build
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodEnvironmentContent.trim());
console.log('Successfully created src/environments/environment.prod.ts for production build.');

// When the Angular build runs with the production configuration,
// it will replace environment.ts with environment.prod.ts.
// Since this script runs before the build, both files will be available.
