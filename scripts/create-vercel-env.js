const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/environments');
const prodTargetPath = path.join(targetDir, 'environment.prod.ts');
const devTargetPath = path.join(targetDir, 'environment.ts');

const prodEnvConfigFile = `export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}',
  googleBooksApiKey: '${process.env.GOOGLE_BOOKS_API_KEY}',
  discogsToken: '${process.env.DISCOGS_TOKEN}',
};
`;

const devEnvConfigFile = `export const environment = {
  production: false,
  supabaseUrl: '',
  supabaseKey: '',
  googleBooksApiKey: '',
  discogsToken: '',
};
`;

// Create the directory if it does not exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFile(prodTargetPath, prodEnvConfigFile, (err) => {
  if (err) {
    console.error('Error writing production environment file:', err);
    throw err;
  } else {
    console.log(`Successfully generated environment.prod.ts`);
  }
});

fs.writeFile(devTargetPath, devEnvConfigFile, (err) => {
  if (err) {
    console.error('Error writing development environment file:', err);
    throw err;
  } else {
    console.log(`Successfully generated environment.ts`);
  }
});
