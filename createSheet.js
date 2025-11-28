import { google } from "googleapis";
import { auth } from "./index.js";

const TEMPLATE = {
    'Track': [
        ['ID', 'Title', 'Version', 'Artist', 'Foreign ID', 'Project ID', 'ISRC', 'Label', 'P Line', 'Duration', 'Mechanical Rate Basis']
    ],
    'Track Rights': [
        ['ISRC', 'Sales Contract Name', 'Sales Contract Percentage', 'Costs Contract Name', 'Costs Contract Percentage'],
        ['', 'Map the track to the contract by using the Contract Name', 'Contract Percentage, a number', 'Map the track to the contract by using the Contract Name', 'Contract Percentage, a number']
    ],
    'Mechanicals': [
        ['ISRC', 'Composer Name', 'Composer CAE Number', 'Publisher Name', 'Publisher CAE Number', 'Contract Name', 'License No', 'Rate', 'Share']
    ],
    'Release Specific Rights': [
        ['ISRC', 'Release Distribution Channel', 'Release Cat No', 'Contract', 'Percentage']
    ],
    'Reference': [
        ['TRUE', 'Sale Date'],
        ['FALSE', 'Custom']
    ]
};

export async function createSheet(req, res) {
    try {
        const authClient = await auth.getClient();
        const sheets = google.sheets({version: 'v4', auth: authClient});
        const drive = google.drive({version: 'v3', auth: authClient});

        const sheetMeta = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: 'TR TEST'
                },
                sheets: Object.keys(TEMPLATE).map(sheetName => ({
                    properties: {
                        title: sheetName
                    }
                }))
            }
        });

        const spreadsheetId = sheetMeta.data.spreadsheetId;

        const requests = Object.entries(TEMPLATE).map(([sheetTitle, values]) => ({
            range: `'${sheetTitle}'!A1`,
            values
        }));

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            requestBody: {
                data: requests,
                valueInputOption: 'RAW'
            }
        });


        // 3. Делаем таблицу публично редактируемой
        await drive.permissions.create({
            fileId: spreadsheetId,
            requestBody: {
                role: 'writer',
                type: 'anyone',
                emailAddress: 'robertkhvaleev3@gmail.com'
            }
        });

        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

        return res.status(200).json({success: true, url})

    } catch (err) {
        console.error(err);
        res.status(500).send({success: false, error: 'Failed to create spreadsheet'});
    }
}
