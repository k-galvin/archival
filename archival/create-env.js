const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;

const envDir = path.join(__dirname, 'src', 'environments');

if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

const devEnvironmentContent = `
export const environment = {
  production: false,
  supabaseUrl: 'http://localhost:54321',
  supabaseKey: 'your-local-supabase-anon-key',
  googleBooksApiKey: 'your-google-books-api-key'
};
`;

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
  fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodEnvironmentContent.trim());
} catch (error) {
  console.error('Error writing environment files:', error);
  process.exit(1);
}
