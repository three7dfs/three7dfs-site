// Three7 DFS website: the files are served as they are; this code only answers /api/me,
// the Premium check for the optimizer pages. It asks Supabase who the signed-in member is,
// then asks Stripe whether that email has an active Premium subscription (the same rule
// as the Shiny apps). The Stripe key is a Cloudflare secret (STRIPE_SECRET_KEY), so it
// never reaches the browser.
const PREMIUM_STATUSES = ["active", "trialing", "past_due"];   // past_due: Stripe is retrying a card
const CACHE_SECS = 600;                                        // remember a member's status 10 min

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/me") return me(request, env, ctx, url);
    return env.ASSETS.fetch(request);
  }
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

async function me(request, env, ctx, url) {
  const out = { paywall: env.PAYWALL === "on", sb: env.SUPABASE_URL, anon: env.SUPABASE_ANON_KEY,
                pay: env.STRIPE_PAYMENT_LINK || "", portal: env.STRIPE_PORTAL_LINK || "", signedIn: false, premium: false };
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return json(out);

  // who is this? Supabase checks the token, so it can't be faked from the browser
  const u = await fetch(env.SUPABASE_URL + "/auth/v1/user", { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: "Bearer " + token } });
  if (!u.ok) return json(out);                     // expired or bad token: signed out
  const user = await u.json();
  const email = String(user.email || "").trim().toLowerCase();
  if (!email) return json(out);
  out.signedIn = true; out.email = email;

  // Premium? remembered for 10 minutes; ?fresh=1 ("Just subscribed? Check again") always asks Stripe
  const cache = caches.default;
  const key = new Request("https://premium-cache.three7dfs.com/" + encodeURIComponent(email));
  if (url.searchParams.get("fresh") !== "1") {
    const hit = await cache.match(key);
    if (hit) { out.premium = (await hit.text()) === "1"; return json(out); }
  }
  if (!env.STRIPE_SECRET_KEY) { out.error = "Premium check isn't set up yet"; return json(out); }
  try {
    out.premium = await stripeIsActive(email, env);
  } catch (e) {
    out.error = "Couldn't reach Stripe"; return json(out, 502);
  }
  ctx.waitUntil(cache.put(key, new Response(out.premium ? "1" : "0", { headers: { "Cache-Control": "max-age=" + CACHE_SECS } })));
  return json(out);
}

async function stripe(path, env) {
  const r = await fetch("https://api.stripe.com/v1/" + path, { headers: { Authorization: "Bearer " + env.STRIPE_SECRET_KEY } });
  if (!r.ok) throw new Error("Stripe " + r.status);
  return r.json();
}

// any Stripe customer with this email holding an active subscription to the Premium product
async function stripeIsActive(email, env) {
  const customers = (await stripe("customers?limit=10&email=" + encodeURIComponent(email), env)).data || [];
  for (const cu of customers) {
    const subs = (await stripe("subscriptions?status=all&limit=20&customer=" + encodeURIComponent(cu.id), env)).data || [];
    for (const s of subs) {
      if (!PREMIUM_STATUSES.includes(s.status)) continue;
      if (!env.STRIPE_PRODUCT_ID) return true;
      const products = ((s.items && s.items.data) || []).map(it => {
        const p = it.price && it.price.product; return typeof p === "object" && p ? p.id : p;
      });
      if (products.includes(env.STRIPE_PRODUCT_ID)) return true;
    }
  }
  return false;
}
