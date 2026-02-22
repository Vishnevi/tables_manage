import { google } from "googleapis";
import { auth } from "../../auth/authClient.js"

const LABEL_MAPPING = {
    1: ['Timeless Moment', 'MUDRA'],
    2: ['Beatlick', 'Intricate Cuts', 'Intricate Records', 'Moscow Vibes', 'Red Ninjas', 'SkyTop'],
    3: ['HOROSHO'],
    4: ['Lostcolor'],
    5: []
};

async function mergeLBGeneric(inputSheetId, targetSheetId, labelValues, includes = false) {
    const authClient = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {
        const firstData = await sheets.spreadsheets.values.get({
            spreadsheetId: inputSheetId,
            range: 'Breakdown!A2:Z'
        });

        const rows = firstData.data.values;



       //фильтрация
        const filteredRows = rows.filter(row => {
            const labelValue = row[11] ? row[11].trim() : '';

            if (includes) {
                return labelValue.includes('Polyptych');
            } else {
                return labelValues.some(label => label && labelValue === label);
            }
        });


        const trackNameOutput = [];
        const ArtistNameOutput = [];
        const ISRCOutput = [];
        const sourceOutput = [];
        const typeOutput = [];
        const periodFromOutput = [];
        const periodToOutput = [];
        const territoryOutput = [];
        const shareOutput = [];
        const rateOutput = [];
        const amountDueOutput = [];
        const amountDueUSDOutput = [];
        const labelNameOutput = [];

        filteredRows.forEach((row) => {
            const trackName = row[0] ? row[0].trim() : '';
            const artistName = row[1] ? row[1].trim() : '';
            const ISRC = row[2] ? row[2].trim() : '';
            const source = row[3] ? row[3].trim() : '';
            const type = row[4] ? row[4].trim() : '';
            const periodFrom = row[5] ? row[5].trim() : '';
            const periodTo = row[6] ? row[6].trim() : '';
            const territory = row[7] ? row[7].trim() : '';
            const share = row[10] ? row[10].trim() : '';
            const rate = row[9] ? row[9].trim() : '';
            const labelName = row[11] ? row[11].trim() : '';

            trackNameOutput.push(trackName);
            ArtistNameOutput.push(artistName);
            ISRCOutput.push(ISRC);
            sourceOutput.push(source);
            typeOutput.push(type);
            periodFromOutput.push(periodFrom);
            periodToOutput.push(periodTo);
            territoryOutput.push(territory);
            shareOutput.push(share);
            rateOutput.push(rate);
            amountDueOutput.push('');
            amountDueUSDOutput.push('');
            labelNameOutput.push(labelName);
        });

        let sumShare = 0;
        for (let i = 0; i < shareOutput.length; i++) {
            sumShare += +(shareOutput[i].replace(',', '.')) || 0;
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId: targetSheetId,
            range: 'Sheet!A2',
            valueInputOption: 'RAW',
            requestBody: {
                values: [
                    ...trackNameOutput.map((trackName, i) => [
                        trackName,
                        ArtistNameOutput[i],
                        ISRCOutput[i],
                        sourceOutput[i],
                        typeOutput[i],
                        periodFromOutput[i],
                        periodToOutput[i],
                        territoryOutput[i],
                        shareOutput[i],
                        rateOutput[i],
                        amountDueOutput[i],
                        amountDueUSDOutput[i],
                        labelNameOutput[i],
                    ]),
                    ['', '', '', '', '', '', '', '', sumShare, '', '', '', ''],
                ]
            }
        });

        return {ok: true, processedRows: filteredRows.length};

    } catch (err) {
        console.error(err);
        return {ok: false, error: 'INTERNAL_ERROR', message: err.message || 'UNKNOWN_ERROR'};
    }
}

export async function mergeLB1(inputSheetId, sheetId1) {
    return await mergeLBGeneric(inputSheetId, sheetId1, LABEL_MAPPING[1]);
}

export async function mergeLB2(inputSheetId, sheetId2) {
    return await mergeLBGeneric(inputSheetId, sheetId2, LABEL_MAPPING[2]);
}

export async function mergeLB3(inputSheetId, sheetId3) {
    return await mergeLBGeneric(inputSheetId, sheetId3, LABEL_MAPPING[3]);
}

export async function mergeLB4(inputSheetId, sheetId4) {
    return await mergeLBGeneric(inputSheetId, sheetId4, LABEL_MAPPING[4]);
}

export async function mergeLB5(inputSheetId, sheetId5) {
    return await mergeLBGeneric(inputSheetId, sheetId5, LABEL_MAPPING[5], true);
}