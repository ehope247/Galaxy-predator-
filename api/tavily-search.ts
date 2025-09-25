// This serverless function proxies requests to the Tavily API.

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
    // Handle pre-flight OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }
  
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "Tavily API key is not configured. Please set the TAVILY_API_KEY environment variable in your project settings." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    try {
        const { teamName } = await req.json();
        if (!teamName) {
            return new Response(JSON.stringify({ error: 'Team name is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });
        }
        
        const query = `Recent news for "${teamName}" regarding the 2025-2026 football season, including player injuries, team form, and pre-match analysis.`;
        
        const tavilyPayload = {
            api_key: apiKey,
            query: query,
            search_depth: "basic",
            include_answer: false,
            max_results: 5,
            topic: "news"
        };

        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tavilyPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(JSON.stringify({ error: `Tavily API error: ${response.statusText}`, details: errorText }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
}