import { google } from "googleapis";
import { getUserAuth } from "../../auth/authUser.js";

const TEMPLATE_LB = {
    'Sheet': [
        ['Track Name', 'Artist Name', 'ISRC Code', 'Source', 'Type', 'Period From', 'Period To', 'Territory', 'Share', 'Contractual Rate', 'Amount Due', 'Amount Due (USD)', 'Label Name']
    ]
};

export async function createLB1() {
    const authClient = await getUserAuth(); // мой gmail
    const drive = google.drive({version: 'v3', auth: authClient});
    const sheets = google.sheets({version: 'v4', auth: authClient});

    const createResp = await drive.files.create({
        requestBody: {
            name: 'Timeless Moment',
            mimeType: 'application/vnd.google-apps.spreadsheet',
        },
        fields: 'id'
    });

    const spreadsheetId = createResp.data.id;
    const templateData = TEMPLATE_LB['Sheet'];
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
                            dimension: 'COLUMNS',
                            startIndex: 0,
                            endIndex: columnCount
                        },
                        properties: { pixelSize: 280 },
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


export async function createLB2() {
    const authClient = await getUserAuth(); // мой gmail
    const drive = google.drive({version: 'v3', auth: authClient});
    const sheets = google.sheets({version: 'v4', auth: authClient});

    const createResp = await drive.files.create({
        requestBody: {
            name: 'Beatlick',
            mimeType: 'application/vnd.google-apps.spreadsheet',
        },
        fields: 'id'
    });

    const spreadsheetId = createResp.data.id;
    const templateData = TEMPLATE_LB['Sheet'];
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
                            dimension: 'COLUMNS',
                            startIndex: 0,
                            endIndex: columnCount
                        },
                        properties: { pixelSize: 280 },
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


export async function createLB3() {
    const authClient = await getUserAuth(); // мой gmail
    const drive = google.drive({version: 'v3', auth: authClient});
    const sheets = google.sheets({version: 'v4', auth: authClient});

    const createResp = await drive.files.create({
        requestBody: {
            name: 'HOROSHO',
            mimeType: 'application/vnd.google-apps.spreadsheet',
        },
        fields: 'id'
    });

    const spreadsheetId = createResp.data.id;
    const templateData = TEMPLATE_LB['Sheet'];
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
                            dimension: 'COLUMNS',
                            startIndex: 0,
                            endIndex: columnCount
                        },
                        properties: { pixelSize: 280 },
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


export async function createLB4() {
    const authClient = await getUserAuth(); // мой gmail
    const drive = google.drive({version: 'v3', auth: authClient});
    const sheets = google.sheets({version: 'v4', auth: authClient});

    const createResp = await drive.files.create({
        requestBody: {
            name: 'Lostcolor',
            mimeType: 'application/vnd.google-apps.spreadsheet',
        },
        fields: 'id'
    });

    const spreadsheetId = createResp.data.id;
    const templateData = TEMPLATE_LB['Sheet'];
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
                            dimension: 'COLUMNS',
                            startIndex: 0,
                            endIndex: columnCount
                        },
                        properties: { pixelSize: 280 },
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


export async function createLB5() {
    const authClient = await getUserAuth(); // мой gmail
    const drive = google.drive({version: 'v3', auth: authClient});
    const sheets = google.sheets({version: 'v4', auth: authClient});

    const createResp = await drive.files.create({
        requestBody: {
            name: 'Polyptych',
            mimeType: 'application/vnd.google-apps.spreadsheet',
        },
        fields: 'id'
    });

    const spreadsheetId = createResp.data.id;
    const templateData = TEMPLATE_LB['Sheet'];
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
                            dimension: 'COLUMNS',
                            startIndex: 0,
                            endIndex: columnCount
                        },
                        properties: { pixelSize: 280 },
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
