import { google } from "googleapis";
import { auth } from "../auth/authClient.js"

export async function mergeToWorks(inputSheetId, sheetIdWorks) {
    const authClient = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {

        return {ok: true};

    } catch (err) {
        console.error(err);
        return {ok: false, error: 'INTERNAL_ERROR', message: err.message || 'UNKNOWN_ERROR'};
    }
}