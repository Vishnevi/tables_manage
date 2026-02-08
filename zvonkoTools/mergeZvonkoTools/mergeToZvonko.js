import { google } from "googleapis";
import { auth } from "../../auth/authClient.js"

export async function mergeToZvonko(inputSheetId, sheetIdZvonko) {
    const authClient = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {
        const firstData = await sheets.spreadsheets.values.get({
            spreadsheetId: inputSheetId,
            range: 'Sheet1!A3:GG'
        });

        const rows = firstData.data.values;

        const titleColumns = [9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85];
        const ISRCColumnLetters = ['K','O','S','W','AA','AE','AI','AM','AQ','AU','AY','BC','BG','BK','BO','BS','BW','CA','CE','CI'];
        const composersColumnLetters = ['CL', 'CM', 'CN', 'CV', 'CW', 'CX', 'DF', 'DG', 'DH', 'DP', 'DQ', 'DR', 'DZ', 'EA', 'EB', 'EJ', 'EK', 'EL', 'ET', 'EU', 'EV', 'FD', 'FE', 'FF', 'FN', 'FO', 'FP', 'FX', 'FY', 'FZ'];
        const composersColumnIndexes = [89, 90, 91, 99, 100, 101, 109, 110, 111, 119, 120, 121, 129, 130, 131, 139, 140, 141, 149, 150, 151, 159, 160, 161, 169, 170, 171, 179, 180, 181];
        const share = [92, 102, 112, 122, 132];
        const shareColumnLetters = ['CO', 'CY', 'DI', 'DS', 'EC'];
        const collect = [96, 106, 116, 126, 136];
        const digits = '1234567890';
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const expectedShares = {
            1: [100],
            2: [50, 50],
            3: [34, 33, 33],
            4: [25, 25, 25, 25],
            5: [20, 20, 20, 20, 20],
        };

        const artistsOutput = [];
        const titlesOutput = [];
        const ISRCOutput = [];
        const composersOutput = [];
        const shareOutput = [];
        const territoryOutput = [];
        const dateOutput = [];
        const platformOutput = [];

        const errors = [];
        const ISRCMap = {};

        rows.forEach((row, rowIndex) => {
            //Artists
            const artists = [4, 5, 6, 7, 8]
                .map(i => row[i])
                .filter(el => el && el.trim() !== '')
                .join(', ');

            //Composers & Share
            const rowComposers = [];
            const validComposers = [];
            let totalShareY = 0;
            const rowNumber = rowIndex + 3;

            for (let i = 0; i < composersColumnIndexes.length; i += 3) {
                const composerIndex = i / 3;

                const firstNameIndex = composersColumnIndexes[i];
                const middleNameIndex = composersColumnIndexes[i + 1];
                const lastNameIndex = composersColumnIndexes[i + 2];

                const firstName = row[firstNameIndex] ? row[firstNameIndex].trim() : '';
                const middleName = row[middleNameIndex] ? row[middleNameIndex].trim() : '';
                const lastName = row[lastNameIndex] ? row[lastNameIndex].trim() : '';

                const composerShare = row[share[composerIndex]] ? parseFloat(row[share[composerIndex]]) : 0;
                const composerCollect = row[collect[composerIndex]] ? row[collect[composerIndex]].trim().toUpperCase() : '';

                const firstNameColLetter = composersColumnLetters[i];
                const lastNameColLetter = composersColumnLetters[i + 2];

                if (firstName && !lastName) {
                    errors.push({
                        type: 'missing-lastName',
                        message: '❌ Missing last name for composer',
                        row: rowNumber,
                        column: lastNameColLetter,
                        firstName: firstName
                    });
                }

                if (!firstName && lastName) {
                    errors.push({
                        type: 'missing-firstName',
                        message: '❌ Missing first name for composer',
                        row: rowNumber,
                        column: firstNameColLetter,
                        lastName: lastName
                    });
                }

                if (firstName && lastName) {
                    const fullName = middleName ? `${firstName} ${middleName} ${lastName}` : `${firstName} ${lastName}`;
                    rowComposers.push(fullName);

                    validComposers.push({
                        name: fullName,
                        share: composerShare,
                        collect: composerCollect,
                        composerIndex: composerIndex
                    });

                    if (composerCollect === 'Y') {
                        totalShareY += composerShare;
                    }
                }
            }

            const composersWithY = validComposers.filter(c => c.collect === 'Y');
            const composersWithN = validComposers.filter(c => c.collect === 'N');
            const allComposersHaveY = validComposers.length > 0 && composersWithN.length === 0;

            if (allComposersHaveY && composersWithY.length > 0) {
                const expected = expectedShares[composersWithY.length];
                if (expected) {
                    for (let i = 0; i < composersWithY.length; i++) {
                        const composer = composersWithY[i];
                        const expectedShare = expected[i];

                        if (composer.share !== expectedShare) {
                            errors.push({
                                type: 'incorrect-share',
                                message: `❌ Incorrect share percentage for Composer ${composer.composerIndex + 1}`,
                                row: rowNumber,
                                column: shareColumnLetters[composer.composerIndex],
                                expected: expectedShare,
                                actual: composer.share
                            });
                        }
                    }
                }
            }

            // ISRC & Title
            titleColumns.forEach((i, colIndex) => {
                const title = row[i];
                const ISRC = row[i + 1];

                const trimmedTitle = title ? title.trim() : '';
                const trimmedISRC = ISRC ? ISRC.trim() : '';

                const rowNumber = rowIndex + 3;
                const ISRCColLetter = ISRCColumnLetters[colIndex];

                if (!trimmedTitle && trimmedISRC) {
                    errors.push({
                        type: 'missing-title',
                        message: '❌ Missing title',
                        row: rowNumber,
                        column: ISRCColLetter,
                        title: trimmedTitle,
                        isrc: trimmedISRC
                    });
                    return;
                }
                if (!trimmedTitle && !trimmedISRC) {
                    return;
                }

                if (trimmedTitle) {
                    if (!trimmedISRC) {
                        errors.push({
                            type: 'missing-isrc',
                            message: '❌ Missing ISRC code',
                            row: rowNumber,
                            column: ISRCColLetter,
                            title: trimmedTitle,
                        });
                    } else {
                        const key = trimmedISRC.toUpperCase();

                        let hasDigit = false;
                        let hasLetter = false;

                        for (let i = 0; i < key.length; i++) {
                            if (digits.includes(key[i])) hasDigit = true;
                            if (letters.includes(key[i])) hasLetter = true;
                            if (hasDigit && hasLetter) break;
                        }

                        if (!hasDigit || !hasLetter || trimmedISRC.length !== 12) {
                            errors.push({
                                type: 'incorrect-isrc',
                                message: '❌ Incorrect ISRC code',
                                isrc: trimmedISRC,
                                row: rowNumber,
                                column: ISRCColLetter,
                                title: trimmedTitle
                            })
                        } else {

                            if (!ISRCMap[key]) {
                                ISRCMap[key] = {
                                    firstRow: rowNumber,
                                    firstTitle: trimmedTitle
                                };
                            } else {
                                const first = ISRCMap[key];
                                errors.push({
                                    type: 'duplicate-isrc',
                                    message: '❌ Duplicate ISRC code',
                                    isrc: trimmedISRC,
                                    row: rowNumber,
                                    column: ISRCColLetter,
                                    title: trimmedTitle,
                                    firstRow: first.firstRow,
                                    firstTitle: first.firstTitle
                                });
                            }
                        }
                    }

                    titlesOutput.push([trimmedTitle]);
                    artistsOutput.push([artists])
                    ISRCOutput.push([trimmedISRC]);
                    composersOutput.push([rowComposers.join(', ')]);
                    shareOutput.push([totalShareY]);
                    territoryOutput.push(['RU | UA | BY | KZ | KG | AZ | AM | MD | GE | TJ | TM']);
                    dateOutput.push(['2021-06-01']);
                    platformOutput.push(['Spotify, iTunes, TikTok, Одноклассники, Apple Music, Deezer, MusixMatch, Яндекс.Музыка, СберЗвук, ВК Музыка, МТС Музыка, YouTube']);
                }
            });
        });

        if (errors.length > 0) {
            console.error('ISRC or title validation errors:', errors);
            return {ok: false, errors};
        }

        await sheets.spreadsheets.values.update({
           spreadsheetId: sheetIdZvonko,
            range: 'Sheet!B2',
            valueInputOption: 'RAW',
            requestBody: {
               values: titlesOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdZvonko,
            range: 'Sheet!C2',
            valueInputOption: 'RAW',
            requestBody: {
                values: artistsOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdZvonko,
            range: 'Sheet!F2',
            valueInputOption: 'RAW',
            requestBody: {
                values: ISRCOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdZvonko,
            range: 'Sheet!D2',
            valueInputOption: 'RAW',
            requestBody: {
                values: composersOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdZvonko,
            range: 'Sheet!E2',
            valueInputOption: 'RAW',
            requestBody: {
                values: composersOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdZvonko,
            range: 'Sheet!G2',
            valueInputOption: 'RAW',
            requestBody: {
                values: shareOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdZvonko,
            range: 'Sheet!H2',
            valueInputOption: 'RAW',
            requestBody: {
                values: territoryOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdZvonko,
            range: 'Sheet!I2',
            valueInputOption: 'RAW',
            requestBody: {
                values: dateOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdZvonko,
            range: 'Sheet!J2',
            valueInputOption: 'RAW',
            requestBody: {
                values: platformOutput
            }
        });

        return {ok: true};

    } catch (err) {
        console.error(err);
        return {ok: false, error: 'INTERNAL_ERROR', message: err.message || 'UNKNOWN_ERROR'};
    }
}