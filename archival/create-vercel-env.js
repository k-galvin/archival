const fs = require('fs');

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}',
  googleBooksApiKey: '${process.env.GOOGLE_BOOKS_API_KEY}',
  discogsToken: '${process.env.DISCOGS_TOKEN}',
};
`;

fs.writeFile(targetPath, envConfigFile, (err) => {
  if (err) {
    console.error(err);
    throw err;
  } else {
    console.log(`Successfully generated environment.prod.ts`);
  }
});
