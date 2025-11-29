import { google } from 'googleapis';
import fs from 'fs/promises';

export async function getUserAuth() {
    const creds = JSON.parse(await fs.readFile('./client_secret.json', 'utf8'));
    const tokens = JSON.parse(await fs.readFile('./token.json', 'utf8'));
    const { client_id, client_secret, redirect_uris } = creds.installed;

    const oAuth2 = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2.setCredentials(tokens);
    return oAuth2;
}