# VAJRAKSH SENTINEL

VAJRAKSH marketing website with a panoramic hero, concise product overview, interactive assessment example, trust and team sections, and a Vercel briefing-request endpoint.

## Deploy to Vercel

Import this folder as a new Vercel project. Leave the framework preset as **Other** and the build command blank. Vercel will serve `index.html`, `styles.css`, `script.js`, `contact-form.js`, and local `assets/` directly.

The briefing form posts to `/api/contact`. The server validates the details, including the selected area of interest, and sends a plain-text email to **contact@vajraksh.com** through Resend. Replying to the notification addresses the visitor. Submissions are received by email; they are not stored in a separate database.

## Configure contact email

1. Connect [Resend to your Vercel project](https://vercel.com/marketplace/resend), or create a Resend API key with permission to send emails.
2. [Verify your sending domain in Resend](https://resend.com/docs/dashboard/domains/introduction) by adding the DNS records it provides. Use a verified sender such as `website@vajraksh.com`; the visitor's address is used only for Reply-To.
3. In Vercel → Project Settings → Environment Variables, add `RESEND_API_KEY` as a secret and `CONTACT_FROM_EMAIL` as `VAJRAKSH Website <website@vajraksh.com>`. Configure the environments you intend to use. `.env.example` lists the required variables; never commit the real key.
4. Deploy the updated project or redeploy after changing environment variables. Keep the framework preset **Other**, no build command, and the default output directory so Vercel serves the static files and discovers `api/contact.js`.
5. Submit a briefing request on the deployment and confirm it arrives at contact@vajraksh.com. A successful API response means Resend accepted the email; use the Resend dashboard to investigate delivery or bounce issues.

The form shows success only after the email service accepts the request. Errors preserve the entered details and offer the contact email as a fallback. The backend rejects invalid or oversized submissions and cross-site browser requests, and includes a honeypot for simple bots. The honeypot does not prevent automated direct API requests; use Vercel Firewall rate limiting if spam becomes an issue.

## Local preview

Open `index.html` in a browser, or serve this directory with any static file server for layout preview. Contact submissions require the Vercel runtime. For a full local preview, install the Vercel CLI, configure the variables from `.env.example` in an ignored `.env.local`, and run `vercel dev` from this directory.

Run automated checks with `node --test tests/*.test.js`. Tests mock the email provider and do not send real emails.

## Design and behaviour

The header theme toggle follows the system colour scheme until the visitor selects light or dark; the preference is stored locally. The assessment console uses synthetic sample data and reviewer decisions are not persisted. Newsreader and Inter are self-hosted under the SIL Open Font License, with licences in `assets/`. The generated monochrome mountain image is also local; no external font or image requests are required.
