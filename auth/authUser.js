import { google } from 'googleapis';
import fs from 'fs/promises';

export async function getUserAuth() {
    let creds, tokens;

    if (process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_TOKEN) {
        creds = JSON.parse(process.env.GOOGLE_CLIENT_SECRET);
        tokens = JSON.parse(process.env.GOOGLE_TOKEN);
    } else {
        creds = JSON.parse(await fs.readFile('./secrets/client_secret.json', 'utf8'));
        tokens = JSON.parse(await fs.readFile('./secrets/token.json', 'utf8'));
    }

    const { client_id, client_secret, redirect_uris } = creds.installed;

    const oAuth2 = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2.setCredentials(tokens);

    oAuth2.on('tokens', (newTokens) => {
        if (newTokens.refresh_token) {
            console.log('🔄 New refresh token received');
            console.log('Update GOOGLE_TOKEN env variable with:', JSON.stringify({
                ...tokens,
                access_token: newTokens.access_token,
                refresh_token: newTokens.refresh_token,
                expiry_date: newTokens.expiry_date
            }));
        }
    });

    return oAuth2;
}