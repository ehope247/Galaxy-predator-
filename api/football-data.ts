// Vercel will automatically turn this file into a serverless function.
// This code runs on the server, not in the browser.

export const config = {
  runtime: 'edge', // Using the Edge runtime for speed.
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const leagueCode = searchParams.get('leagueCode');

  // Handle pre-flight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (!leagueCode) {
    return new Response(JSON.stringify({ error: 'League code is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Football Data API key is not configured. Please set the FOOTBALL_DATA_API_KEY environment variable in your project settings.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const headers = { 'X-Auth-Token': apiKey };
  const dateFrom = new Date();
  const dateTo = new Date();
  dateTo.setDate(dateFrom.getDate() + 7);
  const dateFromString = dateFrom.toISOString().split('T')[0];
  const dateToString = dateTo.toISOString().split('T')[0];
  const targetUrl = `https://api.football-data.org/v4/competitions/${leagueCode}/matches?dateFrom=${dateFromString}&dateTo=${dateToString}`;

  try {
    const response = await fetch(targetUrl, { headers });
    if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ error: `Football-Data API error: ${response.statusText}`, details: errorText }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return new Response(JSON.stringify({ error: 'Internal server error', details: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
  }
}
