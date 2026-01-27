import {google} from "googleapis";

//если есть GOOGLE_SERVICE_ACCOUNT в env (Vercel), используем его
//иначе читаем из файла (локально)
const authConfig = process.env.GOOGLE_SERVICE_ACCOUNT
    ? {
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
    }
    : {
        keyFile: './secrets/google.json',
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
    };

export const auth = new google.auth.GoogleAuth(authConfig);