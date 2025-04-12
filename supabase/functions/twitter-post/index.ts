
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Twitter API credentials stored as secrets in Supabase
const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

function validateEnvironmentVariables() {
  if (!API_KEY) {
    throw new Error("Missing TWITTER_CONSUMER_KEY environment variable");
  }
  if (!API_SECRET) {
    throw new Error("Missing TWITTER_CONSUMER_SECRET environment variable");
  }
  if (!ACCESS_TOKEN) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN environment variable");
  }
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN_SECRET environment variable");
  }
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  console.log("Signature Base String:", signatureBaseString);
  console.log("Generated Signature:", signature);

  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    API_SECRET!,
    ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  return (
    "OAuth " +
    Object.entries(signedOAuthParams)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function sendTweet(tweetText: string): Promise<any> {
  // Use the v2 Twitter API
  const url = "https://api.twitter.com/2/tweets";
  const method = "POST";

  const oauthHeader = generateOAuthHeader(method, url);
  console.log("OAuth Header:", oauthHeader);

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: tweetText }),
  });

  const responseText = await response.text();
  console.log("Response Status:", response.status);
  console.log("Response Body:", responseText);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${responseText}`
    );
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { raw: responseText };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const body = await req.json();
    
    if (!body.text) {
      return new Response(JSON.stringify({ error: "Missing text parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const tweet = await sendTweet(body.text);
    return new Response(JSON.stringify({ success: true, tweet }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("An error occurred:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
