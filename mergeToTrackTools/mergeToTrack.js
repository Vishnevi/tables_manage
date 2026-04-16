import { google } from "googleapis";
import { auth } from "../auth/authClient.js"

export async function mergeToTrack(inputSheetId, sheetIdTrack) { // ПРИНЯЛИ ID ИЗ ИНПУТА
    const authClient = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {
        const firstData = await sheets.spreadsheets.values.get({
           spreadsheetId: inputSheetId,
           range: 'Sheet1!A3:CK'
        });

        const rows = firstData.data.values;

        const titleColumns = [9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85];
        const ISRCColumnLetters = ['K','O','S','W','AA','AE','AI','AM','AQ','AU','AY','BC','BG','BK','BO','BS','BW','CA','CE','CI'];
        const digits = '1234567890';
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const symbols = `!"#$%&'()*+,-./:;<=>?@[]^_\`{|}~`;

        const artistsOutput = [];
        const titlesOutput = [];
        const ISRCOutput = [];


        const errors = [];
        const warnings = [];
        const ISRCMap = {};
        const songTitleMap = {};


       rows.forEach((row, rowIndex) => {
           const artists = [4, 5, 6, 7, 8]
               .map(i => row[i])
               .filter(el => el && el.trim() !== '')
               .join(', ');

           //Варн дубликата SongTitle
           const songTitle = row[0];
           const trimmedSongTitle = songTitle ? songTitle.trim() : '';

           const rowNumber = rowIndex + 3;

           if (trimmedSongTitle) {
               const titleKey = trimmedSongTitle.toLowerCase();
               if (!songTitleMap[titleKey]) {
                   songTitleMap[titleKey] = { firstRow: rowNumber };
               } else {
                   warnings.push({
                       type: 'duplicate-title',
                       message: `⚠️ Duplicate song title (first seen at row ${songTitleMap[titleKey].firstRow})`,
                       row: rowNumber,
                       column: 'A',
                       title: trimmedSongTitle
                   });
               }

               //Латинские ли буквы
               let eachCharacterIsLatin = true;
               let key = trimmedSongTitle.toLowerCase();

               for (let i = 0; i < key.length; i++) {
                   if (!letters.toLowerCase().includes(key[i]) && key[i] !== ' ' && !digits.includes(key[i]) && !symbols.includes(key[i])) eachCharacterIsLatin = false;
                   if (!eachCharacterIsLatin) break;
               }

               if (!eachCharacterIsLatin) {
                   errors.push({
                       type: 'incorrect-song-title',
                       message: '❌ Incorrect song title, title supposed to be in Latin characters',
                       row: rowNumber,
                       column: 'A',
                       title: trimmedSongTitle
                   })
               }
           }

           titleColumns.forEach((i, colIndex) => {
               const title = row[i];
               const ISRC = row[i + 1]; // ISRC находится на следующем индексе от title

               const trimmedTitle = title ? title.trim() : '';
               const trimmedISRC = ISRC ? ISRC.trim() : '';

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
               }
           });
       });

       if (errors.length > 0) {
           console.error('ISRC or title validation errors:', errors);
           return {ok: false, errors};
       }

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdTrack,
            range: 'Track!B3',
            valueInputOption: 'RAW',
            requestBody: {
                values: titlesOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdTrack,
            range: 'Track!D3',
            valueInputOption: 'RAW',
            requestBody: {
                values: artistsOutput
            }
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetIdTrack,
            range: 'Track!G3',
            valueInputOption: 'RAW',
            requestBody: {
                values: ISRCOutput
            }
        });

        return {ok: true, warnings};

    } catch (err) {
        console.error(err);
        return {ok: false, error: 'INTERNAL_ERROR', message: err.message || 'UNKNOWN_ERROR'};
    }
}