# CrediMitra

Production-oriented loan counselling and operations platform.

## Deploy on Render

This repository includes `render.yaml` for a Render Blueprint deployment.

1. Open Render Dashboard.
2. Choose **New → Blueprint**.
3. Connect/select `mailcredivity-blip/credimitra`.
4. Render should detect `render.yaml`.
5. Apply the Blueprint to create:
   - `credimitra` Node web service
   - `credimitra-db` PostgreSQL database
6. Wait until the web service is **Live**.
7. Open `/health`; expected response includes `{"ok":true,"database":"up"}`.

The Blueprint configures Singapore region, a generated JWT secret, PostgreSQL `DATABASE_URL`, WhatsApp number `918918007538`, migrations, and the `/health` check.

## Important production notes

- Only publish verified bank rate data with source and verification date.
- Never collect OTP, PIN, CVV, bank passwords, or other banking credentials.
- Final loan eligibility, approval, rate, sanction and disbursement are decided by the bank.
- Before handling customer documents in production, use private encrypted object storage, malware scanning, strict authorization, retention/deletion controls, and audit logging.
- Complete professional legal/privacy/financial compliance review before public production use.
