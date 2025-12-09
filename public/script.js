const sheetIdInput = document.querySelector("#sheetId");
const createBtn = document.querySelector("#createBtn");
const statusP = document.querySelector("#status");
const syncToTrack = document.querySelector("#syncToTrack");

let newSheetTrackId = '';

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

        if (result.success && result.url) {
            statusP.innerHTML = `✅ Sheet created: <a href="${result.url}" target="_blank">Open it here</a>`;
            newSheetTrackId = result.url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
        } else {
            statusP.innerText = '❌ Error creating sheet.';
        }

    } catch (err) {
        statusP.innerText = '❌ ' + err.message;
    }
});


syncToTrack.addEventListener("click", async () => {
    const sheetIdValue = sheetIdInput.value.trim();

    if (!sheetIdValue) statusP.innerText = 'Please enter a sheet id!';
    if (!newSheetTrackId) statusP.innerText = 'No created sheet! Create a sheet first!';

    statusP.innerText = 'Syncing to track...';

    try {
        const response = await fetch('/sync-track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sheetIdInput: sheetIdValue,
                sheetIdTrack: newSheetTrackId
            })
        })

        const result = await response.json();

        if (!response.ok) {
            if (result.errors && Array.isArray(result.errors) && result.errors.length) {
                statusP.innerHTML =
                    '❌ ISRC errors:<br>' +
                    result.errors.map(err => {
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
            } else {
                statusP.innerText = '❌ Sync to track failed!';
            }
            return;
        }

        if (result.success) statusP.innerText = '✅ Sync to track successfully!';
        else statusP.innerText = '❌ Sync to track failed!';

    } catch (err) {
        statusP.innerText = '❌ ' + err.message;
    }
})