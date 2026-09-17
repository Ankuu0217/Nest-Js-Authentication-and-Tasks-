/**
 * Transactional email HTML — table-based markup with inline styles
 * throughout, because that's still what actually renders consistently
 * across Gmail, Apple Mail, and Outlook's Word-based engine (flexbox/grid
 * and most `<style>` rules don't survive Outlook desktop). Colors are the
 * same Passionfroot tokens the web app uses (DESIGN-3.md / globals.css),
 * hardcoded here since email HTML can't reach a CSS custom property.
 *
 * FOREST_GREEN_TEXT is a same-hue darkened step of --color-forest-green
 * (#00a63e), which only reaches 3.22:1 against white — well under WCAG
 * AA's 4.5:1 for text. This is the same fix already applied to
 * --color-coral-red-text elsewhere in this project; #00a63e stays fine for
 * non-text use (the reference project doesn't currently need it here, but
 * this mirrors that convention rather than introducing a new one).
 */

const INK_BLACK = "#1d1d1c";
const PARCHMENT_CREAM = "#f8f7f2";
const SAND_GRAY = "#d8d6ce";
const CHARCOAL_STONE = "#43423e";
const PAPER_WHITE = "#ffffff";
const DEEP_VIOLET = "#8200db";
const TWILIGHT_INDIGO = "#190922";
const FOREST_GREEN_TEXT = "#007a2e";

const FONT_SANS =
  "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
const FONT_DISPLAY = "'DM Serif Display', Georgia, 'Times New Roman', serif";

interface EmailTemplateOptions {
  preheader: string;
  accentColor: string;
  eyebrow: string;
  headline: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote: string;
}

function renderEmailShell({
  preheader,
  accentColor,
  eyebrow,
  headline,
  bodyHtml,
  cta,
  footerNote,
}: EmailTemplateOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>MyTask</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito+Sans:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      body,
      table,
      td {
        font-family: ${FONT_SANS};
      }
      .display {
        font-family: ${FONT_DISPLAY};
      }
      @media (max-width: 600px) {
        .container {
          width: 100% !important;
        }
        .px {
          padding-left: 24px !important;
          padding-right: 24px !important;
        }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:${PARCHMENT_CREAM};">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PARCHMENT_CREAM};">
      <tr>
        <td align="center" style="padding: 40px 16px;">
          <table
            role="presentation"
            class="container"
            width="560"
            cellpadding="0"
            cellspacing="0"
            style="width:560px; max-width:100%; background-color:${PAPER_WHITE}; border:1px solid ${SAND_GRAY}; border-radius:16px; overflow:hidden;"
          >
            <tr>
              <td style="background-color:${accentColor}; padding: 24px 40px;">
                <span class="display" style="color:${PAPER_WHITE}; font-size:20px; letter-spacing:-0.01em;">MyTask</span>
              </td>
            </tr>
            <tr>
              <td class="px" style="padding: 40px;">
                <p style="margin:0 0 8px; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:${accentColor};">
                  ${eyebrow}
                </p>
                <h1 class="display" style="margin:0 0 16px; font-size:26px; line-height:1.35; color:${INK_BLACK}; font-weight:400;">
                  ${headline}
                </h1>
                <div style="font-size:15px; line-height:1.65; color:${CHARCOAL_STONE};">
                  ${bodyHtml}
                </div>
                ${
                  cta
                    ? `
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top: 28px;">
                  <tr>
                    <td style="border-radius:9999px; background-color:${INK_BLACK};">
                      <a
                        href="${cta.href}"
                        style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:700; color:${PARCHMENT_CREAM}; text-decoration:none; border-radius:9999px;"
                      >${cta.label}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin: 20px 0 0; font-size:13px; line-height:1.5; color:${CHARCOAL_STONE};">
                  Or paste this link into your browser:<br />
                  <a href="${cta.href}" style="color:${accentColor}; word-break:break-all;">${cta.href}</a>
                </p>
                `
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td class="px" style="padding: 24px 40px; border-top:1px solid ${SAND_GRAY};">
                <p style="margin:0; font-size:12px; line-height:1.5; color:${CHARCOAL_STONE};">${footerNote}</p>
                <p style="margin:12px 0 0; font-size:12px; color:${SAND_GRAY};">MyTask — a NestJS + Next.js portfolio project.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function verificationEmailHtml(verificationLink: string): string {
  return renderEmailShell({
    preheader: "Confirm your email to finish setting up your MyTask account.",
    accentColor: DEEP_VIOLET,
    eyebrow: "Verify your email",
    headline: "Welcome to MyTask — let's confirm it's you.",
    bodyHtml: `<p style="margin:0;">One click and you're in. This link is valid for the next <strong>24 hours</strong>.</p>`,
    cta: { label: "Verify email address", href: verificationLink },
    footerNote: "If you didn't create a MyTask account, you can safely ignore this email.",
  });
}

export function resetPasswordEmailHtml(resetLink: string): string {
  return renderEmailShell({
    preheader: "Reset your MyTask password — this link expires in an hour.",
    accentColor: TWILIGHT_INDIGO,
    eyebrow: "Reset your password",
    headline: "Let's get you back in.",
    bodyHtml: `<p style="margin:0;">We got a request to reset the password on your MyTask account. This link is valid for the next <strong>hour</strong>.</p>`,
    cta: { label: "Reset password", href: resetLink },
    footerNote:
      "If you didn't request this, you can ignore this email — your password won't change unless you open the link above and set a new one.",
  });
}

export function passwordChangedEmailHtml(email: string): string {
  return renderEmailShell({
    preheader: "Your MyTask password was just changed.",
    accentColor: FOREST_GREEN_TEXT,
    eyebrow: "Password changed",
    headline: "Your password was just changed.",
    bodyHtml: `<p style="margin:0;">This confirms the password on your MyTask account (<strong>${email}</strong>) was just changed.</p>`,
    footerNote:
      "If this wasn't you, use the \"Forgot password\" link on the login page right away to reset it again.",
  });
}
