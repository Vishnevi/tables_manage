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


        const errors = [];
        const ISRCMap = {};


       rows.forEach((row, rowIndex) => {
           const artists = [4, 5, 6, 7, 8]
               .map(i => row[i])
               .filter(el => el && el.trim() !== '')
               .join(', ');

           titleColumns.forEach(i => {
               const title = row[i];
               const ISRC = row[i + 1]; // ISRC находится на следующем индексе от title

               if (title && title.trim() !== '') {
                   const trimmedTitle = title.trim();
                   const trimmedISRC = ISRC ? ISRC.trim() : '';

                   const rowNumber = rowIndex + 3;

                   if (!trimmedISRC) {
                       errors.push({
                           type: 'missing-isrc',
                           message: '❌ Missing ISRC code',
                           row: rowNumber,
                           title: trimmedTitle
                       });
                   } else {
                       const key = trimmedISRC.toUpperCase();

                       if (!ISRCMap[key]) {
                           ISRCMap[key] = {
                               firstRow: rowNumber,
                               firstTitle: trimmedTitle
                           };
                       } else {
                           const first = ISRCMap[key];
                           errors.push({
                               type: 'duplicate-isrc',
                               message: '❌ Duplicate ISRC code',
                               isrc: trimmedISRC,
                               row: rowNumber,
                               title: trimmedTitle,
                               firstRow: first.firstRow,
                               firstTitle: first.firstTitle
                           });
                       }
                   }

                   titlesOutput.push([trimmedTitle]);
                   artistsOutput.push([artists])
                   ISRCOutput.push([trimmedISRC]);
               }
           });
       });

       if (errors.length > 0) {
           console.error('ISRC validation errors:', errors);
           return {ok: false, errors};
       }

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

        return {ok: true};

    } catch (err) {
        console.error(err);
        return {ok: false, error: 'INTERNAL_ERROR', message: err.message || 'UNKNOWN_ERROR'};
    }
}