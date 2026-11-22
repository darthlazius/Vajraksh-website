# VAJRAKSH SENTINEL

VAJRAKSH marketing website with a panoramic hero, concise product overview, interactive assessment example, trust and team sections, and a Vercel briefing-request endpoint.

## Deploy to Vercel

Import this folder as a new Vercel project. Leave the framework preset as **Other** and the build command blank. Vercel will serve `index.html`, `styles.css`, `script.js`, `contact-form.js`, and local `assets/` directly.

The briefing form posts to `/api/contact`. The server validates the details, including the selected area of interest, and sends a plain-text email to **contact@vajraksh.com** through Resend. Replying to the notification addresses the visitor. Submissions are received by email; they are not stored in a separate database.

## Configure contact email (Resend + Google Workspace)

Google Workspace continues to receive mail at `contact@vajraksh.com`. Resend only sends the website's notifications. No Google app password or SMTP login is required.

1. In Resend, open Domains and add your sending domain (for example `vajraksh.com`, or a dedicated subdomain). Add the sending-verification DNS records displayed by Resend in Cloudflare. Keep the existing Google Workspace MX records; do not enable Resend inbound receiving or replace root MX records. Wait for the sending domain to show Verified.
2. In Resend API Keys, create a Sending access key restricted to the verified domain. If a key was shared in chat or otherwise exposed, revoke it and generate a replacement. Do not paste keys into source files, browser code, commits or chat.
3. In your Vercel website project's Environment Variables settings, add `RESEND_API_KEY` as a Secret and `CONTACT_FROM_EMAIL` as a sender on the verified domain, such as `VAJRAKSH Website <website@vajraksh.com>`. Select Production. `.env.example` contains placeholders only. If a sending subdomain was verified, use that subdomain in the sender address.
4. Deploy the updated source after saving the variables. Changes to Vercel environment variables apply only to new deployments. Remove unused SMTP environment variables after confirming the new deployment works.
5. Submit a briefing request and confirm the notification arrives at `contact@vajraksh.com` in Google Workspace. Replying to the notification addresses the visitor. The Resend dashboard shows delivery, failure and bounce events.

The form reports success only after Resend accepts the request and returns an email ID. Failures preserve the visitor's details and show the contact email as a fallback. The backend validates submissions, uses a fixed recipient, rejects cross-site browser requests and includes a honeypot. Logs omit credentials, submitted personal information and provider error bodies.

Troubleshooting: HTTP `503` means the API key or sender is missing. HTTP `502` means the provider request failed; check the Resend dashboard for domain verification, key permissions, sending limits and delivery events. HTTP `200` means Resend accepted the email, not that it necessarily reached the inbox.

References: [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction), [Resend API keys](https://resend.com/docs/dashboard/api-keys/introduction), [Vercel environment variables](https://vercel.com/docs/environment-variables).

## Local preview

Open `index.html` in a browser, or serve this directory with any static file server for layout preview. Contact submissions require the Vercel runtime. For a full local preview, install the Vercel CLI, configure the variables from `.env.example` in an ignored `.env.local`, and run `vercel dev` from this directory.

Install dependencies with `npm ci`, then run automated checks with `npm test`. Tests mock Resend responses and do not send real emails.

## Design and behaviour

The header theme toggle follows the system colour scheme until the visitor selects light or dark; the preference is stored locally. The assessment console uses synthetic sample data and reviewer decisions are not persisted. Newsreader and Inter are self-hosted under the SIL Open Font License, with licences in `assets/`. The generated monochrome mountain image is also local; no external font or image requests are required.
