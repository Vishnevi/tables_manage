import { google } from 'googleapis';
import fs from 'fs/promises';

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
];

async function main() {
    const creds = JSON.parse(await fs.readFile('./client_secret.json', 'utf8'));
    const { client_id, client_secret, redirect_uris } = creds.installed;
    const oAuth2 = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const authUrl = oAuth2.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('\nOpen this URL in browser:\n', authUrl);
    process.stdout.write('\nPaste the code here: ');

    process.stdin.once('data', async (buf) => {
        const code = buf.toString().trim();
        const { tokens } = await oAuth2.getToken(code);
        await fs.writeFile('./token.json', JSON.stringify(tokens));
        console.log('\nSaved token.json');
        process.exit(0);
    });
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});