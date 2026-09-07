/** @type {import('next').NextConfig} */

// Security headers. frame-ancestors/X-Frame-Options and the no-sniff/referrer/
// permissions headers are safe additions with no compatibility risk. The CSP
// below is deliberately conservative rather than maximally strict:
//   - style-src needs 'unsafe-inline' because this app renders styling via
//     React inline style={{}} objects throughout, which become inline
//     style="..." attributes — CSP treats those the same as <style> tags.
//     Without 'unsafe-inline' here, every page's styling would break.
//   - style-src and font-src also explicitly allow Google Fonts (googleapis.com
//     serves the CSS, gstatic.com serves the actual font files — two different
//     domains, both needed). Missed on the first pass; confirmed broken via a
//     real browser console CSP violation blocking globals.css's @import of
//     Cormorant Garamond/DM Sans, silently falling back to default fonts.
//   - script-src is 'self' only — no inline <script> tags or third-party
//     script embeds exist anywhere in this codebase (checked pages/, _app.js,
//     components/), so this should be safe, but test on staging before prod
//     since a CSP violation shows up as a silent broken feature, not an error
//     the user sees.
//   - connect-src/img-src allow the API and any *.amazonaws.com host, since
//     documents/photos are served via presigned S3 URLs whose exact domain
//     depends on bucket/region and isn't hardcoded anywhere in the app.
// Treat this as a starting point, not a finished CSP — tighten further once
// you've confirmed nothing legitimate gets blocked in staging.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https://*.amazonaws.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://api.datagate.co.in https://*.amazonaws.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
