/**
 * Supabase Edge Function: Discogs Search
 * 
 * Provides a secure proxy to the Discogs API for music release searches.
 * This function bypasses CORS restrictions and hides the Discogs API token from the client.
 * 
 * @request_body { "title": string } - The search query for the music release.
 * @env_vars DISCOGS_TOKEN - Mandatory secret containing the Discogs API Personal Access Token.
 * @returns {DiscogsResponse} - Array of search results directly from Discogs.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle the browser's "preflight" OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Extract the search term from the body
    const { title } = await req.json();
    console.log(`Received search request for: "${title}"`);

    // Retrieve Discogs token from Supabase Secrets
    const token = Deno.env.get('DISCOGS_TOKEN');
    if (!token) {
      console.error('Missing DISCOGS_TOKEN secret!');
      throw new Error('Server configuration error: Missing API Token.');
    }

    // Construct the Discogs API URL (limited to 5 results for UI performance)
    const url = `https://api.discogs.com/database/search?q=${encodeURIComponent(title)}&type=release&per_page=5`;

    console.log(`Fetching from Discogs: ${url}`);

    // Execute the fetch with mandatory Discogs headers (User-Agent is required by Discogs)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'KateArchivalApp/1.0 (LMU Student Project)',
        Authorization: `Discogs token=${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Discogs API responded with ${response.status}: ${errorText}`,
      );
      throw new Error(`Discogs API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `Discogs search successful. Found ${data.results?.length || 0} results.`,
    );

    // Return the data to the Angular client
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Function Error: ${error.message}`);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
