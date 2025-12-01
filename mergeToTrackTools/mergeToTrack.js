import { google } from "googleapis";
import { auth } from "../auth/authClient.js"

export async function mergeToTrack(inputSheetId, sheetIdTrack) { // ПРИНЯЛИ ID ИЗ ИНПУТА
    const authClient = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {
        console.log(`Input sheet id: ${inputSheetId}, new sheet id: ${sheetIdTrack}`);
    } catch (err) {
        console.error(err);
    }
}