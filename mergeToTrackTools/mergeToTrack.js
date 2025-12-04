import { google } from "googleapis";
import { auth } from "../auth/authClient.js"

export async function mergeToTrack(inputSheetId, sheetIdTrack) { // ПРИНЯЛИ ID ИЗ ИНПУТА
    const authClient = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {
        const firstData = await sheets.spreadsheets.values.get({
           spreadsheetId: inputSheetId,
           range: 'Sheet1!A3:CK'
        });

        const rows = firstData.data.values;

        const titleColumns = [9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85];

        const artistsOutput = [];
        const titlesOutput = [];
        const ISRCOutput = [];


       rows.forEach((row) => {
           const artists = [4, 5, 6, 7, 8]
               .map(i => row[i])
               .filter(el => el && el.trim() !== '')
               .join(', ');

           titleColumns.forEach(i => {
               const title = row[i];
               const ISRC = row[i + 1]; // ISRC находится на следующем индексе от title

               if (title && title.trim() !== '') {
                   titlesOutput.push([title]);
                   artistsOutput.push([artists])
                   ISRCOutput.push([ISRC]);
               }
           });
       });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdTrack,
            range: 'Track!B3',
            valueInputOption: 'RAW',
            requestBody: {
                values: titlesOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdTrack,
            range: 'Track!D3',
            valueInputOption: 'RAW',
            requestBody: {
                values: artistsOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdTrack,
            range: 'Track!G3',
            valueInputOption: 'RAW',
            requestBody: {
                values: ISRCOutput
            }
        });

    } catch (err) {
        console.error(err);
    }
}