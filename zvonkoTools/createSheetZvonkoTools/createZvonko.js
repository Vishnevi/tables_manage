import { google } from "googleapis";
import { getUserAuth } from "../../auth/authUser.js";

const TEMPLATE_ZV = {
    'Sheet': [
        ['licensor_id', 'track_title', 'track_artist', 'track_composer', 'track_author', 'track_isrc', 'publishing_share', 'territory', 'effective_date_start', 'platform']
    ]
};

export async function createZvonko() {
    const authClient = await getUserAuth(); // мой gmail
    const drive = google.drive({version: 'v3', auth: authClient});
    const sheets = google.sheets({version: 'v4', auth: authClient});

    const createResp = await drive.files.create({
        requestBody: {
            name: 'Zvonko',
            mimeType: 'application/vnd.google-apps.spreadsheet'
        },
        fields: 'id'
    });

    const spreadsheetId = createResp.data.id;
    const templateData = TEMPLATE_ZV['Sheet'];
    const columnCount = templateData[0].length;
    const rowCount = templateData.length;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    updateSheetProperties: {
                        properties: { sheetId: 0, title: 'Sheet' },
                        fields: 'title'
                    }
                },
                {
                    updateDimensionProperties: {
                        range: {
                            sheetId: 0,
                            dimension: 'ROWS',
                            startIndex: 0,
                            endIndex: rowCount
                        },
                        properties: { pixelSize: 50 },
                        fields: 'pixelSize'
                    }
                },
                {
                    updateDimensionProperties: {
                        range: {
                            sheetId: 0,
                            dimension: 'COLUMNS',
                            startIndex: 0,
                            endIndex: columnCount
                        },
                        properties: { pixelSize: 350 },
                        fields: 'pixelSize'
                    }
                },
                {
                    repeatCell: {
                        range: {
                            sheetId: 0,
                            startRowIndex: 0,
                            endRowIndex: rowCount,
                            startColumnIndex: 0,
                            endColumnIndex: columnCount
                        },
                        cell: {
                            userEnteredFormat: {
                                horizontalAlignment: 'CENTER',
                                verticalAlignment: 'MIDDLE',
                                wrapStrategy: 'WRAP'
                            }
                        },
                        fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,wrapStrategy)'
                    }
                }
            ]
        }
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet!A1',
        valueInputOption: 'RAW',
        requestBody: {
            values: templateData
        }
    });

    await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: { type: 'anyone', role: 'writer' }
    });

    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}