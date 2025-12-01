import {google} from "googleapis";

export const auth = new google.auth.GoogleAuth({
    keyFile: './secrets/google.json',
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]
});