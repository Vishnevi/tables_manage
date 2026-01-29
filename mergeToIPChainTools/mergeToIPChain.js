import { google } from "googleapis";
import { auth } from "../auth/authClient.js"

//преобразование capacity
function getRoleText(capacity) {
    if (capacity === 'CA') return 'Lyrics and Music';
    if (capacity === 'A') return 'Lyrics';
    if (capacity === 'C') return 'Music';
    return '';
}

export async function mergeToIPChain(inputSheetId, sheetIdWorks, isLabel = false) {
    const authClient = await auth.getClient();
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {
        //чтение данных из первой таблицы
        const firstData = await sheets.spreadsheets.values.get({
            spreadsheetId: inputSheetId,
            range: 'Sheet1!A3:GG'
        });

        const rows = firstData.data.values;

        //авторы
        const authors = [
            {
                firstName: 89, middleName: 90, lastName: 91, collect: 96,
                share: 92, capacity: 93, ipi: 95,
                name: 'Author 1',
                columns: { firstName: 'CL', lastName: 'CN', collect: 'CS', share: 'CO', type: 'CP', ipi: 'CR' }
            },
            {
                firstName: 99, middleName: 100, lastName: 101, collect: 106,
                share: 102, capacity: 103, ipi: 105,
                name: 'Author 2',
                columns: { firstName: 'CV', lastName: 'CX', collect: 'DC', share: 'CY', type: 'CZ', ipi: 'DB' }
            },
            {
                firstName: 109, middleName: 110, lastName: 111, collect: 116,
                share: 112, capacity: 113, ipi: 115,
                name: 'Author 3',
                columns: { firstName: 'DF', lastName: 'DH', collect: 'DM', share: 'DI', type: 'DJ', ipi: 'DL' }
            },
            {
                firstName: 119, middleName: 120, lastName: 121, collect: 126,
                share: 122, capacity: 123, ipi: 125,
                name: 'Author 4',
                columns: { firstName: 'DP', lastName: 'DR', collect: 'DW', share: 'DS', type: 'DT', ipi: 'DV' }
            },
            {
                firstName: 129, middleName: 130, lastName: 131, collect: 136,
                share: 132, capacity: 133, ipi: 135,
                name: 'Author 5',
                columns: { firstName: 'DZ', lastName: 'EB', collect: 'EG', share: 'EC', type: 'ED', ipi: 'EF' }
            },
        ];

        //Writer Share
        const expectedShares = {
            1: [100],
            2: [50, 50],
            3: [34, 33, 33],
            4: [25, 25, 25, 25],
            5: [20, 20, 20, 20, 20],
        };

        //Mechanical Owned, Mechanical Collected, Performance Owned, Performance Collected проценты
        const mechanicalPerformancePercentages = {
            1: [50, 50],
            2: [25, 25, 25, 25],
            3: [17, 17, 16.5, 16.5, 16.5, 16.5],
            4: [12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5],
            5: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        };

        //если хоть 1 NO варианты
        const mixedAuthorsValues = {
            '1Y1N': {
                publisher: { M: 50, N: 50, O: 25, P: 25 },
                authorsY: [
                    { Y: 0, Z: 0, AA: 25, AB: 25 }
                ]
            },
            '1Y2N': {
                publisher: { M: 34, N: 34, O: 17, P: 17 },
                authorsY: [
                    { Y: 0, Z: 0, AA: 17, AB: 17 }
                ]
            },
            '2Y1N': {
                publisher: { M: 67, N: 67, O: 34, P: 34 },
                authorsY: [
                    { Y: 0, Z: 0, AA: 17, AB: 17 },
                    { AK: 0, AL: 0, AM: 16, AN: 16 }
                ]
            },
            '1Y3N': {
                publisher: { M: 25, N: 25, O: 12.5, P: 12.5 },
                authorsY: [
                    { Y: 0, Z: 0, AA: 12.5, AB: 12.5 }
                ]
            },
            '2Y2N': {
                publisher: { M: 50, N: 50, O: 25, P: 25 },
                authorsY: [
                    { Y: 0, Z: 0, AA: 12.5, AB: 12.5 },
                    { AK: 0, AL: 0, AM: 12.5, AN: 12.5 }
                ]
            },
            '3Y1N': {
                publisher: { M: 75, N: 75, O: 37.5, P: 37.5 },
                authorsY: [
                    { Y: 0, Z: 0, AA: 12.5, AB: 12.5 },
                    { AK: 0, AL: 0, AM: 12.5, AN: 12.5 },
                    { AW: 0, AX: 0, AY: 12.5, AZ: 12.5 }
                ]
            },
            '1Y4N': {
                publisher: { M: 20, N: 20, O: 10, P: 10 },
                authorsY: [
                    { Y: 0, Z: 0, AA: 10, AB: 10 }
                ]
            },
            '2Y3N': {
                publisher: { M: 40, N: 40, O: 20, P: 20 },
                authorsY: [
                    { Y: 0, Z: 0, AA: 10, AB: 10 },
                    { AK: 0, AL: 0, AM: 10, AN: 10 }
                ]
            },
            '3Y2N': {
                publisher: { M: 60, N: 60, O: 30, P: 30 },
                authorsY: [
                    { Y: 0, Z: 0, AA: 10, AB: 10 },
                    { AK: 0, AL: 0, AM: 10, AN: 10 },
                    { AW: 0, AX: 0, AY: 10, AZ: 10 }
                ]
            },
            '4Y1N': {
                publisher: { M: 80, N: 80, O: 40, P: 40 },
                authorsY: [
                    { Y: 0, Z: 0, AA: 10, AB: 10 },
                    { AK: 0, AL: 0, AM: 10, AN: 10 },
                    { AW: 0, AX: 0, AY: 10, AZ: 10 },
                    { BI: 0, BJ: 0, BK: 10, BL: 10 }
                ]
            }
        };

        //если хоть 1 NO варианты (для isLabel)
        const mixedAuthorsValuesWithLabel = {
            '1Y1N': {
                publisher: { M: 50, N: 50, O: 25, P: 25 },
                authorsY: [
                    { AK: 0, AL: 0, AM: 25, AN: 25 }
                ]
            },
            '1Y2N': {
                publisher: { M: 34, N: 34, O: 17, P: 17 },
                authorsY: [
                    { AK: 0, AL: 0, AM: 17, AN: 17 }
                ]
            },
            '2Y1N': {
                publisher: { M: 67, N: 67, O: 34, P: 34 },
                authorsY: [
                    { AK: 0, AL: 0, AM: 17, AN: 17 },
                    { AW: 0, AX: 0, AY: 16, AZ: 16 }
                ]
            },
            '1Y3N': {
                publisher: { M: 25, N: 25, O: 12.5, P: 12.5 },
                authorsY: [
                    { AK: 0, AL: 0, AM: 12.5, AN: 12.5 }
                ]
            },
            '2Y2N': {
                publisher: { M: 50, N: 50, O: 25, P: 25 },
                authorsY: [
                    { AK: 0, AL: 0, AM: 12.5, AN: 12.5 },
                    { AW: 0, AX: 0, AY: 12.5, AZ: 12.5 }
                ]
            },
            '3Y1N': {
                publisher: { M: 75, N: 75, O: 37.5, P: 37.5 },
                authorsY: [
                    { AK: 0, AL: 0, AM: 12.5, AN: 12.5 },
                    { AW: 0, AX: 0, AY: 12.5, AZ: 12.5 },
                    { BI: 0, BJ: 0, BK: 12.5, BL: 12.5 }
                ]
            },
            '1Y4N': {
                publisher: { M: 20, N: 20, O: 10, P: 10 },
                authorsY: [
                    { AK: 0, AL: 0, AM: 10, AN: 10 }
                ]
            },
            '2Y3N': {
                publisher: { M: 40, N: 40, O: 20, P: 20 },
                authorsY: [
                    { AK: 0, AL: 0, AM: 10, AN: 10 },
                    { AW: 0, AX: 0, AY: 10, AZ: 10 }
                ]
            },
            '3Y2N': {
                publisher: { M: 60, N: 60, O: 30, P: 30 },
                authorsY: [
                    { AK: 0, AL: 0, AM: 10, AN: 10 },
                    { AW: 0, AX: 0, AY: 10, AZ: 10 },
                    { BI: 0, BJ: 0, BK: 10, BL: 10 }
                ]
            },
            '4Y1N': {
                publisher: { M: 80, N: 80, O: 40, P: 40 },
                authorsY: [
                    { AK: 0, AL: 0, AM: 10, AN: 10 },
                    { AW: 0, AX: 0, AY: 10, AZ: 10 },
                    { BI: 0, BJ: 0, BK: 10, BL: 10 },
                    { BU: 0, BV: 0, BW: 10, BX: 10 }
                ]
            }
        };

        const errors = [];

        //все колонки
        const columnData = {
            B: [], E: [], F: [], G: [], H: [], I: [], J: [], K: [], L: [], M: [], N: [], O: [], P: [], Q: [],
            R: [], S: [], T: [], U: [], V: [], W: [], X: [], Y: [], Z: [], AA: [], AB: [], AC: [],
            AD: [], AE: [], AF: [], AG: [], AH: [], AI: [], AJ: [], AK: [], AL: [], AM: [], AN: [], AO: [],
            AP: [], AQ: [], AR: [], AS: [], AT: [], AU: [], AV: [], AW: [], AX: [], AY: [], AZ: [], BA: [],
            BB: [], BC: [], BD: [], BE: [], BF: [], BG: [], BH: [], BI: [], BJ: [], BK: [], BL: [], BM: [],
            BN: [], BO: [], BP: [], BQ: [], BR: [], BS: [], BT: [], BU: [], BV: [], BW: [], BX: [], BY: [],
            BZ: [], CA: [], CB: [], CC: [], CD: [], CE: [], CF: [], CG: [], CH: [], CI: [], CJ: [], CK: []
        };

        rows.forEach((row, rowIndex) => {
            const rowNumber = rowIndex + 3;

            let validAuthorsCount = 0;
            const validAuthors = [];

            authors.forEach((author) => {
                const firstName = row[author.firstName] ? row[author.firstName].trim() : '';
                const lastName = row[author.lastName] ? row[author.lastName].trim() : '';
                const collect = row[author.collect] ? row[author.collect].trim().toUpperCase() : '';


                if (firstName && !lastName) {
                    errors.push({
                        type: 'missing-lastName',
                        message: `❌ Missing last name for ${author.name}`,
                        row: rowNumber,
                        column: author.columns.lastName,
                        firstName: firstName
                    });
                }


                if (!firstName && lastName) {
                    errors.push({
                        type: 'missing-firstName',
                        message: `❌ Missing first name for ${author.name}`,
                        row: rowNumber,
                        column: author.columns.firstName,
                        lastName: lastName
                    });
                }


                if (firstName && lastName) {
                    validAuthors.push({
                        ...author,
                        firstName,
                        middleName: row[author.middleName] ? row[author.middleName].trim() : '',
                        lastName,
                        collect,
                        share: row[author.share] ? parseFloat(row[author.share]) : 0,
                        capacity: row[author.capacity] ? row[author.capacity].trim().toUpperCase() : '',
                        ipi: row[author.ipi] ? row[author.ipi].trim() : ''
                    });


                    if (collect === 'Y') {
                        validAuthorsCount++;
                    }
                }
            });

            //подсчет кол-ва авторов с YES и NO
            const authorsWithY = validAuthors.filter(author => author.collect === 'Y');
            const authorsWithN = validAuthors.filter(author => author.collect === 'N');
            const countY = authorsWithY.length;
            const countN = authorsWithN.length;

            const allAuthorsHaveY = validAuthors.length > 0 && countN === 0;

            if (allAuthorsHaveY && validAuthorsCount > 0) {
                const expected = expectedShares[validAuthorsCount];
                if (expected) {
                    for (let i = 0; i < validAuthorsCount; i++) {
                        const authorShare = validAuthors[i].share;
                        const expectedShare = expected[i];

                        if (authorShare !== expectedShare) {
                            errors.push({
                                type: 'incorrect-share',
                                message: `❌ Incorrect share percentage for ${validAuthors[i].name}`,
                                row: rowNumber,
                                column: validAuthors[i].columns.share,
                                expected: expectedShare,
                                actual: authorShare
                            });
                        }
                    }
                }

                const songTitle = row[0] ? row[0].trim() : '';

                //паблишер (всегда есть)
                columnData.B.push([songTitle]);
                columnData.E.push(['WW']);
                columnData.F.push(['Publisher']);
                columnData.G.push(['Topgunmusic Corp']);
                columnData.H.push(['']);
                columnData.I.push(['']);
                columnData.J.push(['']);
                columnData.K.push(['1092871243']);
                columnData.L.push(['TRUE']);
                columnData.M.push([isLabel ? 0 : 100]);
                columnData.N.push([100]);
                columnData.O.push([isLabel ? 0 : 50]);
                columnData.P.push([50]);
                columnData.Q.push(['Sub Publisher']);

                if (isLabel) {
                    //SUBPUBLISHER на Participant 2
                    columnData.R.push(['Publisher']);
                    columnData.S.push(['SUBPUBLISHER']);
                    columnData.T.push(['']);
                    columnData.U.push(['']);
                    columnData.V.push(['']);
                    columnData.W.push(['']);
                    columnData.X.push(['TRUE']);
                    columnData.Y.push([100]);
                    columnData.Z.push([0]);
                    columnData.AA.push([50]);
                    columnData.AB.push([0]);
                    columnData.AC.push(['Original Publisher']);

                    const percentages = mechanicalPerformancePercentages[validAuthorsCount];

                    //автор 1 (isLabel)
                    const author1 = validAuthors[0];
                    const fullName1 = author1.middleName
                        ? `${author1.firstName} ${author1.middleName} ${author1.lastName}`
                        : `${author1.firstName} ${author1.lastName}`;

                    columnData.AD.push(['Composer']);
                    columnData.AE.push([fullName1]);
                    columnData.AF.push([author1.firstName]);
                    columnData.AG.push([author1.middleName]);
                    columnData.AH.push([author1.lastName]);
                    columnData.AI.push([author1.ipi]);
                    columnData.AJ.push(['TRUE']);
                    columnData.AK.push([0]);
                    columnData.AL.push([0]);
                    columnData.AM.push([percentages[0]]);
                    columnData.AN.push([percentages[1]]);
                    columnData.AO.push([getRoleText(author1.capacity)]);

                    //автор 2 (isLabel)
                    if (validAuthorsCount >= 2) {
                        const author2 = validAuthors[1];
                        const fullName2 = author2.middleName
                            ? `${author2.firstName} ${author2.middleName} ${author2.lastName}`
                            : `${author2.firstName} ${author2.lastName}`;

                        columnData.AP.push(['Composer']);
                        columnData.AQ.push([fullName2]);
                        columnData.AR.push([author2.firstName]);
                        columnData.AS.push([author2.middleName]);
                        columnData.AT.push([author2.lastName]);
                        columnData.AU.push([author2.ipi]);
                        columnData.AV.push(['TRUE']);
                        columnData.AW.push([0]);
                        columnData.AX.push([0]);
                        columnData.AY.push([percentages[2]]);
                        columnData.AZ.push([percentages[3]]);
                        columnData.BA.push([getRoleText(author2.capacity)]);
                    } else {
                        columnData.AP.push(['']);
                        columnData.AQ.push(['']);
                        columnData.AR.push(['']);
                        columnData.AS.push(['']);
                        columnData.AT.push(['']);
                        columnData.AU.push(['']);
                        columnData.AV.push(['']);
                        columnData.AW.push(['']);
                        columnData.AX.push(['']);
                        columnData.AY.push(['']);
                        columnData.AZ.push(['']);
                        columnData.BA.push(['']);
                    }

                    //автор 3 (isLabel)
                    if (validAuthorsCount >= 3) {
                        const author3 = validAuthors[2];
                        const fullName3 = author3.middleName
                            ? `${author3.firstName} ${author3.middleName} ${author3.lastName}`
                            : `${author3.firstName} ${author3.lastName}`;

                        columnData.BB.push(['Composer']);
                        columnData.BC.push([fullName3]);
                        columnData.BD.push([author3.firstName]);
                        columnData.BE.push([author3.middleName]);
                        columnData.BF.push([author3.lastName]);
                        columnData.BG.push([author3.ipi]);
                        columnData.BH.push(['TRUE']);
                        columnData.BI.push([0]);
                        columnData.BJ.push([0]);
                        columnData.BK.push([percentages[4]]);
                        columnData.BL.push([percentages[5]]);
                        columnData.BM.push([getRoleText(author3.capacity)]);
                    } else {
                        columnData.BB.push(['']);
                        columnData.BC.push(['']);
                        columnData.BD.push(['']);
                        columnData.BE.push(['']);
                        columnData.BF.push(['']);
                        columnData.BG.push(['']);
                        columnData.BH.push(['']);
                        columnData.BI.push(['']);
                        columnData.BJ.push(['']);
                        columnData.BK.push(['']);
                        columnData.BL.push(['']);
                        columnData.BM.push(['']);
                    }

                    //автор 4 (isLabel)
                    if (validAuthorsCount >= 4) {
                        const author4 = validAuthors[3];
                        const fullName4 = author4.middleName
                            ? `${author4.firstName} ${author4.middleName} ${author4.lastName}`
                            : `${author4.firstName} ${author4.lastName}`;

                        columnData.BN.push(['Composer']);
                        columnData.BO.push([fullName4]);
                        columnData.BP.push([author4.firstName]);
                        columnData.BQ.push([author4.middleName]);
                        columnData.BR.push([author4.lastName]);
                        columnData.BS.push([author4.ipi]);
                        columnData.BT.push(['TRUE']);
                        columnData.BU.push([0]);
                        columnData.BV.push([0]);
                        columnData.BW.push([percentages[6]]);
                        columnData.BX.push([percentages[7]]);
                        columnData.BY.push([getRoleText(author4.capacity)]);
                    } else {
                        columnData.BN.push(['']);
                        columnData.BO.push(['']);
                        columnData.BP.push(['']);
                        columnData.BQ.push(['']);
                        columnData.BR.push(['']);
                        columnData.BS.push(['']);
                        columnData.BT.push(['']);
                        columnData.BU.push(['']);
                        columnData.BV.push(['']);
                        columnData.BW.push(['']);
                        columnData.BX.push(['']);
                        columnData.BY.push(['']);
                    }

                    //автор 5 (isLabel)
                    if (validAuthorsCount >= 5) {
                        const author5 = validAuthors[4];
                        const fullName5 = author5.middleName
                            ? `${author5.firstName} ${author5.middleName} ${author5.lastName}`
                            : `${author5.firstName} ${author5.lastName}`;

                        columnData.BZ.push(['Composer']);
                        columnData.CA.push([fullName5]);
                        columnData.CB.push([author5.firstName]);
                        columnData.CC.push([author5.middleName]);
                        columnData.CD.push([author5.lastName]);
                        columnData.CE.push([author5.ipi]);
                        columnData.CF.push(['TRUE']);
                        columnData.CG.push([0]);
                        columnData.CH.push([0]);
                        columnData.CI.push([percentages[8]]);
                        columnData.CJ.push([percentages[9]]);
                        columnData.CK.push([getRoleText(author5.capacity)]);
                    } else {
                        columnData.BZ.push(['']);
                        columnData.CA.push(['']);
                        columnData.CB.push(['']);
                        columnData.CC.push(['']);
                        columnData.CD.push(['']);
                        columnData.CE.push(['']);
                        columnData.CF.push(['']);
                        columnData.CG.push(['']);
                        columnData.CH.push(['']);
                        columnData.CI.push(['']);
                        columnData.CJ.push(['']);
                        columnData.CK.push(['']);
                    }
                } else {
                    //автор 1 (всегда есть)
                    const author1 = validAuthors[0];
                    const fullName1 = author1.middleName
                        ? `${author1.firstName} ${author1.middleName} ${author1.lastName}`
                        : `${author1.firstName} ${author1.lastName}`;

                    columnData.R.push(['Composer']);
                    columnData.S.push([fullName1]);
                    columnData.T.push([author1.firstName]);
                    columnData.U.push([author1.middleName]);
                    columnData.V.push([author1.lastName]);
                    columnData.W.push([author1.ipi]);
                    columnData.X.push(['TRUE']);
                    columnData.Y.push([0]);
                    columnData.Z.push([0]);

                    const percentages = mechanicalPerformancePercentages[validAuthorsCount];
                    columnData.AA.push([percentages[0]]);
                    columnData.AB.push([percentages[1]]);
                    columnData.AC.push([getRoleText(author1.capacity)]);

                    //автор 2
                    if (validAuthorsCount >= 2) {
                        const author2 = validAuthors[1];
                        const fullName2 = author2.middleName
                            ? `${author2.firstName} ${author2.middleName} ${author2.lastName}`
                            : `${author2.firstName} ${author2.lastName}`;

                        columnData.AD.push(['Composer']);
                        columnData.AE.push([fullName2]);
                        columnData.AF.push([author2.firstName]);
                        columnData.AG.push([author2.middleName]);
                        columnData.AH.push([author2.lastName]);
                        columnData.AI.push([author2.ipi]);
                        columnData.AJ.push(['TRUE']);
                        columnData.AK.push([0]);
                        columnData.AL.push([0]);
                        columnData.AM.push([percentages[2]]);
                        columnData.AN.push([percentages[3]]);
                        columnData.AO.push([getRoleText(author2.capacity)]);
                    } else {
                        //если автора нет
                        columnData.AD.push(['']);
                        columnData.AE.push(['']);
                        columnData.AF.push(['']);
                        columnData.AG.push(['']);
                        columnData.AH.push(['']);
                        columnData.AI.push(['']);
                        columnData.AJ.push(['']);
                        columnData.AK.push(['']);
                        columnData.AL.push(['']);
                        columnData.AM.push(['']);
                        columnData.AN.push(['']);
                        columnData.AO.push(['']);
                    }

                    //автор 3
                    if (validAuthorsCount >= 3) {
                        const author3 = validAuthors[2];
                        const fullName3 = author3.middleName
                            ? `${author3.firstName} ${author3.middleName} ${author3.lastName}`
                            : `${author3.firstName} ${author3.lastName}`;

                        columnData.AP.push(['Composer']);
                        columnData.AQ.push([fullName3]);
                        columnData.AR.push([author3.firstName]);
                        columnData.AS.push([author3.middleName]);
                        columnData.AT.push([author3.lastName]);
                        columnData.AU.push([author3.ipi]);
                        columnData.AV.push(['TRUE']);
                        columnData.AW.push([0]);
                        columnData.AX.push([0]);
                        columnData.AY.push([percentages[4]]);
                        columnData.AZ.push([percentages[5]]);
                        columnData.BA.push([getRoleText(author3.capacity)]);
                    } else {
                        columnData.AP.push(['']);
                        columnData.AQ.push(['']);
                        columnData.AR.push(['']);
                        columnData.AS.push(['']);
                        columnData.AT.push(['']);
                        columnData.AU.push(['']);
                        columnData.AV.push(['']);
                        columnData.AW.push(['']);
                        columnData.AX.push(['']);
                        columnData.AY.push(['']);
                        columnData.AZ.push(['']);
                        columnData.BA.push(['']);
                    }

                    //автор 4
                    if (validAuthorsCount >= 4) {
                        const author4 = validAuthors[3];
                        const fullName4 = author4.middleName
                            ? `${author4.firstName} ${author4.middleName} ${author4.lastName}`
                            : `${author4.firstName} ${author4.lastName}`;

                        columnData.BB.push(['Composer']);
                        columnData.BC.push([fullName4]);
                        columnData.BD.push([author4.firstName]);
                        columnData.BE.push([author4.middleName]);
                        columnData.BF.push([author4.lastName]);
                        columnData.BG.push([author4.ipi]);
                        columnData.BH.push(['TRUE']);
                        columnData.BI.push([0]);
                        columnData.BJ.push([0]);
                        columnData.BK.push([percentages[6]]);
                        columnData.BL.push([percentages[7]]);
                        columnData.BM.push([getRoleText(author4.capacity)]);
                    } else {
                        columnData.BB.push(['']);
                        columnData.BC.push(['']);
                        columnData.BD.push(['']);
                        columnData.BE.push(['']);
                        columnData.BF.push(['']);
                        columnData.BG.push(['']);
                        columnData.BH.push(['']);
                        columnData.BI.push(['']);
                        columnData.BJ.push(['']);
                        columnData.BK.push(['']);
                        columnData.BL.push(['']);
                        columnData.BM.push(['']);
                    }

                    //автор 5
                    if (validAuthorsCount >= 5) {
                        const author5 = validAuthors[4];
                        const fullName5 = author5.middleName
                            ? `${author5.firstName} ${author5.middleName} ${author5.lastName}`
                            : `${author5.firstName} ${author5.lastName}`;

                        columnData.BN.push(['Composer']);
                        columnData.BO.push([fullName5]);
                        columnData.BP.push([author5.firstName]);
                        columnData.BQ.push([author5.middleName]);
                        columnData.BR.push([author5.lastName]);
                        columnData.BS.push([author5.ipi]);
                        columnData.BT.push(['TRUE']);
                        columnData.BU.push([0]);
                        columnData.BV.push([0]);
                        columnData.BW.push([percentages[8]]);
                        columnData.BX.push([percentages[9]]);
                        columnData.BY.push([getRoleText(author5.capacity)]);
                    } else {
                        columnData.BN.push(['']);
                        columnData.BO.push(['']);
                        columnData.BP.push(['']);
                        columnData.BQ.push(['']);
                        columnData.BR.push(['']);
                        columnData.BS.push(['']);
                        columnData.BT.push(['']);
                        columnData.BU.push(['']);
                        columnData.BV.push(['']);
                        columnData.BW.push(['']);
                        columnData.BX.push(['']);
                        columnData.BY.push(['']);
                    }

                    //Participant 7 пустой (без лейбла)
                    columnData.BZ.push(['']);
                    columnData.CA.push(['']);
                    columnData.CB.push(['']);
                    columnData.CC.push(['']);
                    columnData.CD.push(['']);
                    columnData.CE.push(['']);
                    columnData.CF.push(['']);
                    columnData.CG.push(['']);
                    columnData.CH.push(['']);
                    columnData.CI.push(['']);
                    columnData.CJ.push(['']);
                    columnData.CK.push(['']);
                }
            } else if (countY > 0 && countN > 0) {
                const conditionKey = `${countY}Y${countN}N`;
                const mixedValues = isLabel ? mixedAuthorsValuesWithLabel[conditionKey] : mixedAuthorsValues[conditionKey];

                if (!mixedValues) {
                    Object.keys(columnData).forEach(col => {
                        columnData[col].push(['']);
                        columnData[col].push(['']);
                    });
                    return;
                }

                const songTitle = row[0] ? row[0].trim() : '';

                //ПЕРВАЯ СТРОКА: авторы с YES
                columnData.B.push([songTitle]);
                columnData.E.push(['WW']);
                columnData.F.push(['Publisher']);
                columnData.G.push(['Topgunmusic Corp']);
                columnData.K.push(['1092871243']);
                columnData.L.push(['TRUE']);

                //скипаем firstName, middleName, lastName Participant 1 (не используются для паблишера)
                columnData.H.push(['']);
                columnData.I.push(['']);
                columnData.J.push(['']);

                //Publisher Mechanical/Performance
                columnData.M.push([isLabel ? 0 : mixedValues.publisher.M]);
                columnData.N.push([mixedValues.publisher.N]);
                columnData.O.push([isLabel ? 0 : mixedValues.publisher.O]);
                columnData.P.push([mixedValues.publisher.P]);
                columnData.Q.push(['Sub Publisher']);

                if (isLabel) {
                    //SUBPUBLISHER на Participant 2
                    columnData.R.push(['Publisher']);
                    columnData.S.push(['SUBPUBLISHER']);
                    columnData.T.push(['']);
                    columnData.U.push(['']);
                    columnData.V.push(['']);
                    columnData.W.push(['']);
                    columnData.X.push(['TRUE']);
                    columnData.Y.push([mixedValues.publisher.M]);
                    columnData.Z.push([0]);
                    columnData.AA.push([mixedValues.publisher.O]);
                    columnData.AB.push([0]);
                    columnData.AC.push(['Original Publisher']);
                }

                //колонки авторов с YES (начиная с Participant 2 или 3 при isLabel)
                const participantColumnsY = isLabel ? [
                    { type: 'AD', name: 'AE', firstName: 'AF', middleName: 'AG', lastName: 'AH', ipi: 'AI', controlled: 'AJ', capacity: 'AO' },
                    { type: 'AP', name: 'AQ', firstName: 'AR', middleName: 'AS', lastName: 'AT', ipi: 'AU', controlled: 'AV', capacity: 'BA' },
                    { type: 'BB', name: 'BC', firstName: 'BD', middleName: 'BE', lastName: 'BF', ipi: 'BG', controlled: 'BH', capacity: 'BM' },
                    { type: 'BN', name: 'BO', firstName: 'BP', middleName: 'BQ', lastName: 'BR', ipi: 'BS', controlled: 'BT', capacity: 'BY' },
                    { type: 'BZ', name: 'CA', firstName: 'CB', middleName: 'CC', lastName: 'CD', ipi: 'CE', controlled: 'CF', capacity: 'CK' }
                ] : [
                    { type: 'R', name: 'S', firstName: 'T', middleName: 'U', lastName: 'V', ipi: 'W', controlled: 'X', capacity: 'AC' },
                    { type: 'AD', name: 'AE', firstName: 'AF', middleName: 'AG', lastName: 'AH', ipi: 'AI', controlled: 'AJ', capacity: 'AO' },
                    { type: 'AP', name: 'AQ', firstName: 'AR', middleName: 'AS', lastName: 'AT', ipi: 'AU', controlled: 'AV', capacity: 'BA' },
                    { type: 'BB', name: 'BC', firstName: 'BD', middleName: 'BE', lastName: 'BF', ipi: 'BG', controlled: 'BH', capacity: 'BM' },
                    { type: 'BN', name: 'BO', firstName: 'BP', middleName: 'BQ', lastName: 'BR', ipi: 'BS', controlled: 'BT', capacity: 'BY' }
                ];

                for (let i = 0; i < 5; i++) {
                    const cols = participantColumnsY[i];

                    if (i < countY) {
                        const author = authorsWithY[i];
                        const fullName = author.middleName
                            ? `${author.firstName} ${author.middleName} ${author.lastName}`
                            : `${author.firstName} ${author.lastName}`;

                        columnData[cols.type].push(['Composer']);
                        columnData[cols.name].push([fullName]);
                        columnData[cols.firstName].push([author.firstName]);
                        columnData[cols.middleName].push([author.middleName]);
                        columnData[cols.lastName].push([author.lastName]);
                        columnData[cols.ipi].push([author.ipi]);
                        columnData[cols.controlled].push(['TRUE']);

                        //Mechanical/Performance
                        const authorValues = mixedValues.authorsY[i];
                        const mechanicalOwnedCol = Object.keys(authorValues)[0];
                        const mechanicalCollectedCol = Object.keys(authorValues)[1];
                        const performanceOwnedCol = Object.keys(authorValues)[2];
                        const performanceCollectedCol = Object.keys(authorValues)[3];

                        columnData[mechanicalOwnedCol].push([authorValues[mechanicalOwnedCol]]);
                        columnData[mechanicalCollectedCol].push([authorValues[mechanicalCollectedCol]]);
                        columnData[performanceOwnedCol].push([authorValues[performanceOwnedCol]]);
                        columnData[performanceCollectedCol].push([authorValues[performanceCollectedCol]]);

                        columnData[cols.capacity].push([getRoleText(author.capacity)]);
                    } else {
                        columnData[cols.type].push(['']);
                        columnData[cols.name].push(['']);
                        columnData[cols.firstName].push(['']);
                        columnData[cols.middleName].push(['']);
                        columnData[cols.lastName].push(['']);
                        columnData[cols.ipi].push(['']);
                        columnData[cols.controlled].push(['']);
                        columnData[cols.capacity].push(['']);

                        if (i === 0) {
                            if (!isLabel) {
                                columnData.Y.push(['']);
                                columnData.Z.push(['']);
                                columnData.AA.push(['']);
                                columnData.AB.push(['']);
                            } else {
                                columnData.AK.push(['']);
                                columnData.AL.push(['']);
                                columnData.AM.push(['']);
                                columnData.AN.push(['']);
                            }
                        } else if (i === 1) {
                            if (!isLabel) {
                                columnData.AK.push(['']);
                                columnData.AL.push(['']);
                                columnData.AM.push(['']);
                                columnData.AN.push(['']);
                            } else {
                                columnData.AW.push(['']);
                                columnData.AX.push(['']);
                                columnData.AY.push(['']);
                                columnData.AZ.push(['']);
                            }
                        } else if (i === 2) {
                            if (!isLabel) {
                                columnData.AW.push(['']);
                                columnData.AX.push(['']);
                                columnData.AY.push(['']);
                                columnData.AZ.push(['']);
                            } else {
                                columnData.BI.push(['']);
                                columnData.BJ.push(['']);
                                columnData.BK.push(['']);
                                columnData.BL.push(['']);
                            }
                        } else if (i === 3) {
                            if (!isLabel) {
                                columnData.BI.push(['']);
                                columnData.BJ.push(['']);
                                columnData.BK.push(['']);
                                columnData.BL.push(['']);
                            } else {
                                columnData.BU.push(['']);
                                columnData.BV.push(['']);
                                columnData.BW.push(['']);
                                columnData.BX.push(['']);
                            }
                        } else if (i === 4) {
                            if (!isLabel) {
                                columnData.BU.push(['']);
                                columnData.BV.push(['']);
                                columnData.BW.push(['']);
                                columnData.BX.push(['']);
                            } else {
                                columnData.CG.push(['']);
                                columnData.CH.push(['']);
                                columnData.CI.push(['']);
                                columnData.CJ.push(['']);
                            }
                        }
                    }
                }

                //Participant 7 (без лейбла) (авторы Y)
                if (!isLabel) {
                    columnData.BZ.push(['']);
                    columnData.CA.push(['']);
                    columnData.CB.push(['']);
                    columnData.CC.push(['']);
                    columnData.CD.push(['']);
                    columnData.CE.push(['']);
                    columnData.CF.push(['']);
                    columnData.CG.push(['']);
                    columnData.CH.push(['']);
                    columnData.CI.push(['']);
                    columnData.CJ.push(['']);
                    columnData.CK.push(['']);
                }

                //колонки авторов с NO (начиная с Participant 1)
                const participantColumnsN = [
                    { type: 'F', name: 'G', firstName: 'H', middleName: 'I', lastName: 'J', ipi: 'K', controlled: 'L',
                      mechanical: { owned: 'M', collected: 'N' }, performance: { owned: 'O', collected: 'P' }, capacity: 'Q' },
                    { type: 'R', name: 'S', firstName: 'T', middleName: 'U', lastName: 'V', ipi: 'W', controlled: 'X',
                      mechanical: { owned: 'Y', collected: 'Z' }, performance: { owned: 'AA', collected: 'AB' }, capacity: 'AC' },
                    { type: 'AD', name: 'AE', firstName: 'AF', middleName: 'AG', lastName: 'AH', ipi: 'AI', controlled: 'AJ',
                      mechanical: { owned: 'AK', collected: 'AL' }, performance: { owned: 'AM', collected: 'AN' }, capacity: 'AO' },
                    { type: 'AP', name: 'AQ', firstName: 'AR', middleName: 'AS', lastName: 'AT', ipi: 'AU', controlled: 'AV',
                      mechanical: { owned: 'AW', collected: 'AX' }, performance: { owned: 'AY', collected: 'AZ' }, capacity: 'BA' },
                    { type: 'BB', name: 'BC', firstName: 'BD', middleName: 'BE', lastName: 'BF', ipi: 'BG', controlled: 'BH',
                      mechanical: { owned: 'BI', collected: 'BJ' }, performance: { owned: 'BK', collected: 'BL' }, capacity: 'BM' }
                ];

                //ВТОРАЯ СТРОКА: авторы с NO
                columnData.B.push([songTitle]);
                columnData.E.push(['WW']);

                for (let i = 0; i < 5; i++) {
                    const cols = participantColumnsN[i];

                    if (i < countN) {
                        const author = authorsWithN[i];
                        const fullName = author.middleName
                            ? `${author.firstName} ${author.middleName} ${author.lastName}`
                            : `${author.firstName} ${author.lastName}`;

                        const writerShare = author.share;

                        console.log(`N author ${i}: cols.type=${cols.type}, cols.name=${cols.name}, fullName=${fullName}`);
                        columnData[cols.type].push(['Composer']);
                        columnData[cols.name].push([fullName]);
                        columnData[cols.firstName].push([author.firstName]);
                        columnData[cols.middleName].push([author.middleName]);
                        columnData[cols.lastName].push([author.lastName]);
                        columnData[cols.ipi].push([author.ipi]);
                        columnData[cols.controlled].push(['FALSE']);
                        columnData[cols.mechanical.owned].push([writerShare]);
                        columnData[cols.mechanical.collected].push([writerShare]);
                        columnData[cols.performance.owned].push([writerShare]);
                        columnData[cols.performance.collected].push([writerShare]);
                        columnData[cols.capacity].push([getRoleText(author.capacity)]);
                    } else {
                        columnData[cols.type].push(['']);
                        columnData[cols.name].push(['']);
                        columnData[cols.firstName].push(['']);
                        columnData[cols.middleName].push(['']);
                        columnData[cols.lastName].push(['']);
                        columnData[cols.ipi].push(['']);
                        columnData[cols.controlled].push(['']);
                        columnData[cols.mechanical.owned].push(['']);
                        columnData[cols.mechanical.collected].push(['']);
                        columnData[cols.performance.owned].push(['']);
                        columnData[cols.performance.collected].push(['']);
                        columnData[cols.capacity].push(['']);
                    }
                }

                //Participant 6 пустой для второй строки (авторы N)
                columnData.BN.push(['']);
                columnData.BO.push(['']);
                columnData.BP.push(['']);
                columnData.BQ.push(['']);
                columnData.BR.push(['']);
                columnData.BS.push(['']);
                columnData.BT.push(['']);
                columnData.BU.push(['']);
                columnData.BV.push(['']);
                columnData.BW.push(['']);
                columnData.BX.push(['']);
                columnData.BY.push(['']);

                //Participant 7 пустой для второй строки (авторы N)
                columnData.BZ.push(['']);
                columnData.CA.push(['']);
                columnData.CB.push(['']);
                columnData.CC.push(['']);
                columnData.CD.push(['']);
                columnData.CE.push(['']);
                columnData.CF.push(['']);
                columnData.CG.push(['']);
                columnData.CH.push(['']);
                columnData.CI.push(['']);
                columnData.CJ.push(['']);
                columnData.CK.push(['']);
            } else {
                Object.keys(columnData).forEach(col => {
                    columnData[col].push(['']);
                });
            }
        });

        //ошибки
        if (errors.length > 0) {
            console.error('Validation errors:', errors);
            return {ok: false, errors};
        }


        //фикс quota exceeded используя batchUpdate
        const batchUpdateData = [];

        Object.keys(columnData).forEach(column => {
            if (columnData[column].length > 0) {
                batchUpdateData.push({
                    range: `IP Chain!${column}3`,
                    values: columnData[column]
                });
            }
        });

        if (batchUpdateData.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: sheetIdWorks,
                requestBody: {
                    valueInputOption: 'RAW',
                    data: batchUpdateData
                }
            });
        }

        return {ok: true};

    } catch (err) {
        console.error(err);
        return {ok: false, error: 'INTERNAL_ERROR', message: err.message || 'UNKNOWN_ERROR'};
    }
}
