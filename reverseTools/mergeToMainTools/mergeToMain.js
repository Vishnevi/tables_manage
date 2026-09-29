import { google } from "googleapis";
import { auth } from "../../auth/authClient.js"

function getCapacity(roleText) {
    if (roleText === 'Lyrics and Music') return 'CA';
    if (roleText === 'Lyrics') return 'A';
    if (roleText === 'Music') return 'C';
    return '';
}

export async function mergeToMain(sheetIdTrack, sheetIdWorks, sheetIdMain) {
    const authClient = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {
        const trackData = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetIdTrack,
            range: 'Track!A3:R'
        });

        const worksData = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetIdWorks,
            range: 'Works!A3:Z'
        });

        const ipChainData = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetIdWorks,
            range: 'IP Chain!A3:CK'
        });

        const trackRows = trackData.data.values || [];
        const worksRows = worksData.data.values || [];
        const ipChainRows = ipChainData.data.values || [];

        const columnCount = 189;
        const performerColumns = [4, 5, 6, 7, 8];
        const titleColumns = [9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85];
        const writerColumns = [89, 99, 109, 119, 129, 139, 149, 159, 169, 179];
        const participantColumns = [5, 17, 29, 41, 53, 65, 77];

        const ISRCMap = {};
        const participantsMap = {};
        const mainOutput = [];

        trackRows.forEach((row) => {
            const title = row[1] ? row[1].trim() : '';
            const ISRC = row[6] ? row[6].trim() : '';

            if (ISRC) {
                ISRCMap[ISRC.toUpperCase()] = title;
            }
        });

        ipChainRows.forEach((row) => {
            const workTitle = row[1] ? row[1].trim() : '';

            if (!workTitle) {
                return;
            }

            const titleKey = workTitle.toLowerCase();
            if (!participantsMap[titleKey]) {
                participantsMap[titleKey] = [];
            }

            participantColumns.forEach((i) => {
                const type = row[i] ? row[i].trim() : '';

                if (type !== 'Composer') {
                    return;
                }

                participantsMap[titleKey].push({
                    name: row[i + 1] ? row[i + 1].trim() : '',
                    firstName: row[i + 2] ? row[i + 2].trim() : '',
                    middleName: row[i + 3] ? row[i + 3].trim() : '',
                    lastName: row[i + 4] ? row[i + 4].trim() : '',
                    ipi: row[i + 5] ? row[i + 5].trim() : '',
                    controlled: row[i + 6] ? row[i + 6].trim().toUpperCase() : '',
                    share: row[i + 7] ? parseFloat(row[i + 7]) : 0,
                    capacity: row[i + 11] ? row[i + 11].trim() : ''
                });
            });
        });

        worksRows.forEach((row) => {
            const mainRow = new Array(columnCount).fill('');

            const songTitle = row[1] ? row[1].trim() : '';
            mainRow[0] = songTitle;

            const performers = row[20] ? row[20].split(';').map(el => el.trim()).filter(el => el) : [];
            performers.slice(0, performerColumns.length).forEach((performer, i) => {
                mainRow[performerColumns[i]] = performer;
            });

            const ISRCs = row[21] ? row[21].split(';').map(el => el.trim()).filter(el => el) : [];
            ISRCs.slice(0, titleColumns.length).forEach((ISRC, i) => {
                mainRow[titleColumns[i]] = ISRCMap[ISRC.toUpperCase()] || '';
                mainRow[titleColumns[i] + 1] = ISRC;
            });

            const composers = row[2] ? row[2].split(',').map(el => el.trim()).filter(el => el) : [];
            const participants = participantsMap[songTitle.toLowerCase()] || [];

            const writers = composers.slice(0, writerColumns.length).map((fullName) => {
                const participant = participants.find(p => p.name === fullName);

                if (participant) {
                    return participant;
                }

                const parts = fullName.split(' ').filter(el => el);
                return {
                    name: fullName,
                    firstName: parts[0],
                    middleName: parts.slice(1, -1).join(' '),
                    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
                    ipi: '',
                    controlled: '',
                    share: 0,
                    capacity: ''
                };
            });

            const writersWithY = writers.filter(writer => writer.controlled === 'TRUE');
            const writersWithN = writers.filter(writer => writer.controlled === 'FALSE');
            const totalShareN = writersWithN.reduce((sum, writer) => sum + writer.share, 0);

            writers.forEach((writer, i) => {
                const col = writerColumns[i];

                mainRow[col] = writer.firstName;
                mainRow[col + 1] = writer.middleName;
                mainRow[col + 2] = writer.lastName;
                mainRow[col + 4] = getCapacity(writer.capacity);
                mainRow[col + 6] = writer.ipi;

                if (writer.controlled === 'TRUE') {
                    mainRow[col + 3] = writersWithY.length === 1 ? `${100 - totalShareN}%` : '';
                    mainRow[col + 7] = 'Y';
                    mainRow[col + 8] = 'Topgunmusic Corp';
                    mainRow[col + 9] = '1092871243';
                }

                if (writer.controlled === 'FALSE') {
                    mainRow[col + 3] = `${writer.share}%`;
                    mainRow[col + 7] = 'N';
                }
            });

            mainOutput.push(mainRow);
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdMain,
            range: 'Sheet1!A3',
            valueInputOption: 'RAW',
            requestBody: {
                values: mainOutput
            }
        });

        return {ok: true, processedRows: mainOutput.filter(row => row[0]).length};

    } catch (err) {
        console.error(err);
        return {ok: false, error: 'INTERNAL_ERROR', message: err.message || 'UNKNOWN_ERROR'};
    }
}
