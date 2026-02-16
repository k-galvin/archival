const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src/environments');
const targetPath = path.join(targetDir, 'environment.prod.ts');

const envConfigFile = `export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}',
  googleBooksApiKey: '${process.env.GOOGLE_BOOKS_API_KEY}',
  discogsToken: '${process.env.DISCOGS_TOKEN}',
};
`;

// Create the directory if it does not exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFile(targetPath, envConfigFile, (err) => {
  if (err) {
    console.error(err);
    throw err;
  } else {
    console.log(`Successfully generated environment.prod.ts`);
  }
});
