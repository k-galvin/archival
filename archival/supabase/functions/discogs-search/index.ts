const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // 2. Handle the browser's "preflight" OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // 3. Extract the search term from the body
    // Note: Angular must send { "title": "search-term" }
    const { title } = await req.json();
    console.log(`Received search request for: "${title}"`);

    // 4. Get your Discogs token from Supabase Secrets
    const token = Deno.env.get('DISCOGS_TOKEN');
    if (!token) {
      console.error('Missing DISCOGS_TOKEN secret!');
      throw new Error('Server configuration error: Missing API Token.');
    }

    // 5. Construct the Discogs API URL
    // We limit to 5 results to keep the response fast for the Acquisition page
    const url = `https://api.discogs.com/database/search?q=${encodeURIComponent(title)}&type=release&per_page=5`;

    console.log(`Fetching from Discogs: ${url}`);

    // 6. Execute the fetch with mandatory Discogs headers
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

    // 7. Return the data to Angular
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
