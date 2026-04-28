
# Disaster Response Hub

## Render Deployment

This repository is ready to deploy as a Render web service.

### Build and start
- Build command: `npm run build`
- Start command: `npm run start`

### Required environment variables
Set these in your Render web service:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_ADMIN_EMAIL`
- `NEXT_PUBLIC_CHAT_API_URL` if the backend is deployed as a separate Railway service

### Recommended setup
1. Deploy the backend as its own Render service if you want live chat and dashboard data.
2. Copy the backend service URL into `NEXT_PUBLIC_CHAT_API_URL` for the frontend.
3. Add your Render domain to Firebase Authentication authorized domains.
4. Set `NEXT_PUBLIC_ADMIN_EMAIL` to the single admin account email for this deployment.

