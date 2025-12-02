import { google } from "googleapis";
import { auth } from "../auth/authClient.js"

export async function mergeToTrack(inputSheetId, sheetIdTrack) { // ПРИНЯЛИ ID ИЗ ИНПУТА
    const authClient = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {
        const firstData = await sheets.spreadsheets.values.get({
           spreadsheetId: inputSheetId,
           range: 'Sheet1!A3:'
        });

        const rows = firstData.data.values;

        // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        //
        // тут написать правила переноса данных из колонок
        //
        // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

        const existingRows = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetIdTrack,
            range: 'Track!A3:R'
        });

        const currentRows = existingRows.data.values || [];


    } catch (err) {
        console.error(err);
    }
}