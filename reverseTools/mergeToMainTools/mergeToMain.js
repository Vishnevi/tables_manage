import { google } from "googleapis";
import { auth } from "../../auth/authClient.js"

function getCapacity(roleText) {
    if (roleText === 'Lyrics and Music') return 'CA';
    if (roleText === 'Lyrics') return 'A';
    if (roleText === 'Music') return 'C';
    return '';
}

function parseShare(value) {
    return value ? parseFloat(value.trim().replace(',', '.')) || 0 : 0;
}

function roundShare(value) {
    return Math.round(value * 100) / 100;
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
        const totalShareYMap = {};
        const mainOutput = [];

        trackRows.forEach((row) => {
            const title = row[1] ? row[1].trim() : '';
            const ISRC = row[6] ? row[6].trim() : '';

            if (ISRC) {
                ISRCMap[ISRC.toUpperCase()] = title;
            }
        });

        ipChainRows.forEach((row) => {
            const workId = row[0] ? row[0].trim() : '';
            const workTitle = row[1] ? row[1].trim() : '';

            if (!workTitle) {
                return;
            }

            const titleKey = workId || workTitle.toLowerCase();
            if (!participantsMap[titleKey]) {
                participantsMap[titleKey] = [];
            }

            participantColumns.forEach((i) => {
                const type = row[i] ? row[i].trim() : '';
                const name = row[i + 1] ? row[i + 1].trim() : '';

                if (type === 'Publisher' && name === 'Topgunmusic Corp') {
                    totalShareYMap[titleKey] = parseShare(row[i + 8]);
                    return;
                }

                if (type !== 'Composer') {
                    return;
                }

                const performanceOwned = parseShare(row[i + 9]);
                const existing = participantsMap[titleKey].find(p => p.name === name);

                if (existing) {
                    existing.performanceOwned += performanceOwned;
                    return;
                }

                participantsMap[titleKey].push({
                    name: name,
                    firstName: row[i + 2] ? row[i + 2].trim() : '',
                    middleName: row[i + 3] ? row[i + 3].trim() : '',
                    lastName: row[i + 4] ? row[i + 4].trim() : '',
                    ipi: row[i + 5] ? row[i + 5].trim() : '',
                    controlled: row[i + 6] ? row[i + 6].trim().toUpperCase() : '',
                    performanceOwned: performanceOwned,
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
            const workId = row[0] ? row[0].trim() : '';
            const titleKey = workId || songTitle.toLowerCase();
            const participants = participantsMap[titleKey] || [];

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
                    performanceOwned: 0,
                    capacity: ''
                };
            });

            const writersWithY = writers.filter(writer => writer.controlled === 'TRUE');
            const writersWithN = writers.filter(writer => writer.controlled === 'FALSE');
            const totalShareY = totalShareYMap[titleKey] || 0;
            const totalShareN = 100 - totalShareY;
            const totalPerformanceN = writersWithN.reduce((sum, writer) => sum + writer.performanceOwned, 0);
            const shares = new Map();

            let restShareY = totalShareY;
            writersWithY.forEach((writer, i) => {
                const share = i === writersWithY.length - 1 ? roundShare(restShareY) : roundShare(writer.performanceOwned * 2);
                shares.set(writer, share);
                restShareY -= share;
            });

            let restShareN = totalShareN;
            writersWithN.forEach((writer, i) => {
                const share = i === writersWithN.length - 1 ? roundShare(restShareN) : roundShare(totalPerformanceN ? totalShareN * writer.performanceOwned / totalPerformanceN : 0);
                shares.set(writer, share);
                restShareN -= share;
            });

            writers.forEach((writer, i) => {
                const col = writerColumns[i];

                mainRow[col] = writer.firstName;
                mainRow[col + 1] = writer.middleName;
                mainRow[col + 2] = writer.lastName;
                mainRow[col + 4] = getCapacity(writer.capacity);
                mainRow[col + 6] = writer.ipi;

                if (writer.controlled === 'TRUE') {
                    mainRow[col + 3] = `${shares.get(writer)}%`;
                    mainRow[col + 7] = 'Y';
                    mainRow[col + 8] = 'Topgunmusic Corp';
                    mainRow[col + 9] = '1092871243';
                }

                if (writer.controlled === 'FALSE') {
                    mainRow[col + 3] = `${shares.get(writer)}%`;
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
