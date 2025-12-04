import { google } from "googleapis";
import { getUserAuth } from "../auth/authUser.js";

const TEMPLATE = {
    'Track': [
        ['ID', 'Title', 'Version', 'Artist', 'Foreign ID', 'Project ID', 'ISRC', 'Label', 'P Line', 'Duration', 'Mechanical Rate Basis', 'Custom US Statutory Mechanical Rate', 'Custom Canadian Statutory Mechanical Rate', 'Report Mechanicals', 'Catalogue Groups', 'Default Release Distribution Channel', 'Default Release Cat No', 'Aliases'],
        ['Leave blank if a new Track', '', '', '', '', '', '', '', '', 'Number of seconds', 'Sale Date or Custom', '', '', 'TRUE or FALSE', 'Separate multiple groups using a semi-colon (;)', 'Must match your Distribution Channels setup in Settings', '', 'Separate multiple aliases using a semi-colon (;)']
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

export async function createSheet() {
    const authClient = await getUserAuth(); // мой gmail
    const drive  = google.drive({version: 'v3', auth: authClient});
    const sheets = google.sheets({version: 'v4', auth: authClient});

    const createResp = await drive.files.create({
        requestBody: {
            name: 'TR TEST',
            mimeType: 'application/vnd.google-apps.spreadsheet'
        },
        fields: 'id'
    });
    const spreadsheetId = createResp.data.id;

    const sheetTitles = Object.keys(TEMPLATE);
    const requests = [];

    requests.push({ updateSheetProperties: {
            properties: { sheetId: 0, title: sheetTitles[0] },
            fields: 'title'
        }});

    for (let i = 1; i < sheetTitles.length; i++) {
        requests.push({ addSheet: { properties: { title: sheetTitles[i] } } });
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests }
    });

    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
            valueInputOption: 'RAW',
            data: sheetTitles.map(title => ({
                range: `'${title}'!A1`,
                values: TEMPLATE[title]
            }))
        }
    });

    const meta = await sheets.spreadsheets.get({ spreadsheetId });

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: (meta.data.sheets || [])
                .filter(el => sheetTitles.includes(el.properties.title)) // только нужные листы
                .flatMap(el => {
                    return [
                        {
                        updateDimensionProperties: {
                            range: {
                                sheetId: el.properties.sheetId,
                                dimension: 'ROWS',
                                startIndex: 0,  // строка 1
                                endIndex: 2  // строка 2
                            },
                            properties: { pixelSize: 100 }, // высота
                            fields: 'pixelSize'
                        }
                        },
                        {
                        updateDimensionProperties: {
                            range: {
                                sheetId: el.properties.sheetId,
                                dimension: 'COLUMNS',
                                startIndex: 0,  // колонка A
                                endIndex: TEMPLATE[el.properties.title][0].length  // до последней колонки шаблона
                            },
                            properties: { pixelSize: 300 }, // ширина
                            fields: 'pixelSize'
                        }
                        }
                    ];
                })
        }
    });

    await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: { type: 'anyone', role: 'writer' }
    });

    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}
