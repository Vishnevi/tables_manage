const sheetIdInput = document.querySelector("#sheetId");
const createBtn = document.querySelector("#createBtn");
const statusP = document.querySelector("#status");
const syncBtn = document.querySelector("#syncBtn");

let newSheetTrackId = '';
let newSheetWorksId = '';

createBtn.addEventListener("click", async () => {
    const sheetIdValue = sheetIdInput.value.trim();

    if (!sheetIdValue) statusP.innerText = 'Please enter a sheet id!';

    statusP.innerText = 'Creating Sheet...';

    try {
        const response = await fetch('/create-sheet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sheetId: sheetIdValue})
        });


        const result = await response.json();

        if (result.success && result.urlTrack && result.urlWorks) {
            statusP.innerHTML = `
                ✅ Track Sheet created: <a href="${result.urlTrack}" target="_blank">Open it here</a><br>
                ✅ Works Sheet created: <a href="${result.urlWorks}" target="_blank">Open it here</a>`;
            newSheetTrackId = result.urlTrack.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
            newSheetWorksId = result.urlWorks.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
        } else {
            statusP.innerText = '❌ Error creating sheet.';
        }

    } catch (err) {
        statusP.innerText = '❌ ' + err.message;
    }
});


syncBtn.addEventListener("click", async () => {
    const sheetIdValue = sheetIdInput.value.trim();

    if (!sheetIdValue) {
        statusP.innerText = 'Please enter a sheet id!';
        return;
    }
    if (!newSheetTrackId || !newSheetWorksId) {
        statusP.innerText = 'No created sheets! Create sheets first!';
        return;
    }

    statusP.innerText = 'Syncing...';

    try {
        const [trackResponse, worksResponse] = await Promise.all([
            fetch('/sync-track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sheetIdInput: sheetIdValue,
                    sheetIdTrack: newSheetTrackId
                })
            }),
            fetch('/sync-works', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sheetIdInput: sheetIdValue,
                    sheetIdWorks: newSheetWorksId
                })
            })
        ]);

        const trackResult = await trackResponse.json();
        const worksResult = await worksResponse.json();

        let errorMessages = [];

        if (!trackResponse.ok) {
            if (trackResult.errors && Array.isArray(trackResult.errors) && trackResult.errors.length) {
                const trackErrors = trackResult.errors.map(err => {
                    if (err.type === 'missing-title') {
                        return `Row ${err.row}, Column "${err.column}" — ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'missing-isrc') {
                        return `Row ${err.row}, Column "${err.column}" — ${err.message}`;
                    }
                    if (err.type === 'duplicate-isrc') {
                        return `Row ${err.row}, Column "${err.column}" — ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'incorrect-isrc') {
                        return `Row ${err.row}, Column "${err.column}" — ${err.message} "${err.isrc}"`;
                    }
                    return `Row ${err.row || '?'}: ${err.message || 'Error'}`;
                }).join('<br>');
                errorMessages.push('❌ <b>Track ISRC errors:</b><br>' + trackErrors);
            } else {
                errorMessages.push('❌ Sync to track failed!');
            }
        }

        if (!worksResponse.ok) {
            if (worksResult.errors && Array.isArray(worksResult.errors) && worksResult.errors.length) {
                const worksErrors = worksResult.errors.map(err => {
                    if (err.type === 'missing-title') {
                        return `Row ${err.row}, Column "${err.column}" — ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'missing-isrc') {
                        return `Row ${err.row}, Column "${err.column}" — ${err.message}`;
                    }
                    if (err.type === 'duplicate-isrc') {
                        return `Row ${err.row}, Column "${err.column}" — ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'incorrect-isrc') {
                        return `Row ${err.row}, Column "${err.column}" — ${err.message} "${err.isrc}"`;
                    }
                    return `Row ${err.row || '?'}: ${err.message || 'Error'}`;
                }).join('<br>');
                errorMessages.push('❌ <b>Works ISRC errors:</b><br>' + worksErrors);
            } else {
                errorMessages.push('❌ Sync to works failed!');
            }
        }

        if (errorMessages.length > 0) {
            statusP.innerHTML = errorMessages.join('<br><br>');
            return;
        }

        if (trackResult.success && worksResult.success) {
            statusP.innerText = '✅ Sync successfully!';
        } else {
            statusP.innerText = '❌ Sync failed!';
        }

    } catch (err) {
        statusP.innerText = '❌ ' + err.message;
    }
});