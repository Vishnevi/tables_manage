import { google } from 'googleapis';
import fs from 'fs/promises';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
];

async function main() {
    const creds = JSON.parse(await fs.readFile('./secrets/client_secret.json', 'utf8'));
    const { client_id, client_secret, redirect_uris } = creds.installed;

    const oAuth2 = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const authUrl = oAuth2.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    console.log(authUrl);

    const rl = readline.createInterface({ input, output });
    const code = await rl.question('\ninsert here: ');
    await rl.close();

    const { tokens } = await oAuth2.getToken(code.trim());

    await fs.writeFile('./secrets/token.json', JSON.stringify(tokens, null, 2), 'utf8');
    console.log('\n✅ SUCCESS');
}

main().catch(err => {
    console.error('Error generating token:', err);
});