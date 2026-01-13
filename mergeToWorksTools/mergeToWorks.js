import { google } from "googleapis";
import { auth } from "../auth/authClient.js"

export async function mergeToWorks(inputSheetId, sheetIdWorks) {
    const authClient = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {
        //чтение данных из первой таблицы
        const firstData = await sheets.spreadsheets.values.get({
            spreadsheetId: inputSheetId,
            range: 'Sheet1!A3:GG'
        });

        const rows = firstData.data.values;

        //обработка данных (трансформация тип)
        const titleColumns = [9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85];
        const ISRCColumnLetters = ['K','O','S','W','AA','AE','AI','AM','AQ','AU','AY','BC','BG','BK','BO','BS','BW','CA','CE','CI'];
        const composersColumnLetters = ['CL', 'CM', 'CN', 'CV', 'CW', 'CX', 'DF', 'DG', 'DH', 'DP', 'DQ', 'DR', 'DZ', 'EA', 'EB', 'EJ', 'EK', 'EL', 'ET', 'EU', 'EV', 'FD', 'FE', 'FF', 'FN', 'FO', 'FP', 'FX', 'FY', 'FZ'];
        const composersColumnIndexes = [89, 90, 91, 99, 100, 101, 109, 110, 111, 119, 120, 121, 129, 130, 131, 139, 140, 141, 149, 150, 151, 159, 160, 161, 169, 170, 171, 179, 180, 181];
        const digits = '1234567890';
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        //Лист Works
        const songTitleOutput = []; //Лист Works - Title (B)
        const performersOutput = []; //Лист Works Performers (U)
        const ISRCOutput = []; //Лист Works - Track ISRCs (V)
        const territoriesOutput = []; //Лист Works - Territories (W)
        const composersOutput = []; // Лист Works - Composers (C)

        //Лист Participators
        const workTitleOutput = []; //Лист Participators - Work Title (B)
        const contractOutput = []; //Лист Participators - Contract (E)
        const rateOutput = []; //Лист Participators - Rate (F)

        const errors = [];
        const ISRCMap = {};

        rows.forEach((row, rowIndex) => {
            //Лист Works
            //Title
            const songTitle = row[0];
            const trimmedSongTitle = songTitle ? songTitle.trim() : '';
            songTitleOutput.push([trimmedSongTitle]);

            //Territories
            territoriesOutput.push([trimmedSongTitle ? 'WW' : '']);

            //Composers
            const rowComposers = [];
            const rowNumber = rowIndex + 3;
            for (let i = 0; i < composersColumnIndexes.length; i += 3) {
                const firstNameIndex = composersColumnIndexes[i];
                const middleNameIndex = composersColumnIndexes[i + 1];
                const lastNameIndex = composersColumnIndexes[i + 2];

                const firstName = row[firstNameIndex] ? row[firstNameIndex].trim() : '';
                const middleName = row[middleNameIndex] ? row[middleNameIndex].trim() : '';
                const lastName = row[lastNameIndex] ? row[lastNameIndex].trim() : '';

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
                }
            }
            composersOutput.push([rowComposers.join(', ')]);

            //Performers
            const performers = [4, 5, 6, 7, 8]
                .map(i => row[i])
                .filter(el => el && el.trim() !== '')
                .join(';');
            performersOutput.push([performers]);

            //ISRC
            const rowISRC = [];
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

                    rowISRC.push(trimmedISRC);
                }
            });
            const joinedISRC = rowISRC.join(';');
            ISRCOutput.push([joinedISRC]);


            //Лист Participators
            //Work Title
            const workTitle = row[0];
            const trimmedWorkTitle = workTitle ? workTitle.trim() : '';
            workTitleOutput.push([trimmedWorkTitle]);

            //Contract
            contractOutput.push([trimmedWorkTitle ? 'test' : '']);

            //Rate
            rateOutput.push([trimmedWorkTitle ? 100 : '']);

        });

        //ошибки
        if (errors.length > 0) {
            console.error('ISRC validation errors:', errors);
            return {ok: false, errors};
        }


        //отправляю запросы на аптейт данных (финал)
        //Лист Works
        await sheets.spreadsheets.values.update({ //Лист Works - Title (B)
            spreadsheetId: sheetIdWorks,
            range: 'Works!B3',
            valueInputOption: 'RAW',
            requestBody: {
                values: songTitleOutput
            }
        });

        await sheets.spreadsheets.values.update({ //Лист Works - Territories (W)
            spreadsheetId: sheetIdWorks,
            range: 'Works!W3',
            valueInputOption: 'RAW',
            requestBody: {
                values: territoriesOutput
            }
        });

        await sheets.spreadsheets.values.update({ //Лист Works Performers (U)
            spreadsheetId: sheetIdWorks,
            range: 'Works!U3',
            valueInputOption: 'RAW',
            requestBody: {
                values: performersOutput
            }
        });

        await sheets.spreadsheets.values.update({ //Лист Works - Track ISRCs (V)
            spreadsheetId: sheetIdWorks,
            range: 'Works!V3',
            valueInputOption: 'RAW',
            requestBody: {
                values: ISRCOutput
            }
        });

        await sheets.spreadsheets.values.update({ // Лист Works - Composers (C)
            spreadsheetId: sheetIdWorks,
            range: 'Works!C3',
            valueInputOption: 'RAW',
            requestBody: {
                values: composersOutput
            }
        });

        //Лист Participators
        await sheets.spreadsheets.values.update({ //Лист Participators - Work Title (B)
            spreadsheetId: sheetIdWorks,
            range: 'Participators!B3',
            valueInputOption: 'RAW',
            requestBody: {
                values: workTitleOutput
            }
        });

        await sheets.spreadsheets.values.update({ //Лист Participators - Contract (E)
            spreadsheetId: sheetIdWorks,
            range: 'Participators!E3',
            valueInputOption: 'RAW',
            requestBody: {
                values: contractOutput
            }
        });

        await sheets.spreadsheets.values.update({ //Лист Participators - Rate (F)
            spreadsheetId: sheetIdWorks,
            range: 'Participators!F3',
            valueInputOption: 'RAW',
            requestBody: {
                values: rateOutput
            }
        });


        return {ok: true};

    } catch (err) {
        console.error(err);
        return {ok: false, error: 'INTERNAL_ERROR', message: err.message || 'UNKNOWN_ERROR'};
    }
}