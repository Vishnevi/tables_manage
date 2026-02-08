export const sheetIdInput = document.querySelector("#sheetInputId");
const createBtn = document.querySelector("#createBtn");
const statusP = document.querySelector("#status");
const syncBtn = document.querySelector("#syncBtn");
const isLabelCheckbox = document.querySelector("#isLabelCheckbox");

let newSheetTrackId = '';
let newSheetWorksId = '';

createBtn.addEventListener("click", async () => {

    statusP.innerText = 'Creating Sheet...';

    try {
        const response = await fetch('/create-sheet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
        });


        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login.html';
            return;
        }

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
        const [trackResponse, worksResponse, ipChainResponse] = await Promise.all([
            fetch('/sync-track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    sheetIdInput: sheetIdValue,
                    sheetIdTrack: newSheetTrackId
                })
            }),
            fetch('/sync-works', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    sheetIdInput: sheetIdValue,
                    sheetIdWorks: newSheetWorksId
                })
            }),
            fetch('/sync-ipchain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    sheetIdInput: sheetIdValue,
                    sheetIdWorks: newSheetWorksId,
                    isLabel: isLabelCheckbox.checked
                })
            })
        ]);

        if (trackResponse.status === 401 || worksResponse.status === 401 || ipChainResponse.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login.html';
            return;
        }

        const trackResult = await trackResponse.json();
        const worksResult = await worksResponse.json();
        const ipChainResult = await ipChainResponse.json();

        let errorMessages = [];

        if (!trackResponse.ok) {
            if (trackResult.errors && Array.isArray(trackResult.errors) && trackResult.errors.length) {
                const trackErrors = trackResult.errors.map(err => {
                    if (err.type === 'missing-title') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'missing-isrc') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.title}"`;
                    }
                    if (err.type === 'duplicate-isrc') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'incorrect-isrc') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.isrc}"`;
                    }
                    return `Row ${err.row || '?'}: ${err.message || 'Error'}`;
                }).join('<br>');
                errorMessages.push('❌ <b>Track errors:</b><br>' + trackErrors);
            } else {
                errorMessages.push('❌ Sync to track failed!');
            }
        }

        if (!worksResponse.ok) {
            if (worksResult.errors && Array.isArray(worksResult.errors) && worksResult.errors.length) {
                const worksErrors = worksResult.errors.map(err => {
                    if (err.type === 'missing-title') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'missing-isrc') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.title}"`;
                    }
                    if (err.type === 'duplicate-isrc') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'incorrect-isrc') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'missing-firstName') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message}, (Will be: "firstName" + ${err.lastName})`;
                    }
                    if (err.type === 'missing-lastName') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message}, (Will be: ${err.firstName} + "lastName")`;
                    }
                    return `Row ${err.row || '?'}: ${err.message || 'Error'}`;
                }).join('<br>');
                errorMessages.push('❌ <b>Works errors:</b><br>' + worksErrors);
            } else {
                errorMessages.push('❌ Sync to works failed!');
            }
        }

        if (!ipChainResponse.ok) {
            if (ipChainResult.errors && Array.isArray(ipChainResult.errors) && ipChainResult.errors.length) {
                const ipChainErrors = ipChainResult.errors.map(err => {
                    if (err.type === 'missing-lastName') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message}`;
                    }
                    if (err.type === 'missing-firstName') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message}`;
                    }
                    if (err.type === 'incorrect-share') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} Expected: ${err.expected}, Actual: ${err.actual}`;
                    }
                }).join('<br>');
                errorMessages.push('❌ <b>IP Chain errors:</b><br>' + ipChainErrors);
            } else {
                errorMessages.push('❌ Sync to Ip Chain failed!')
            }
        }

        if (errorMessages.length > 0) {
            statusP.innerHTML = errorMessages.join('<br><br>');
            return;
        }

        if (trackResult.success && worksResult.success && ipChainResult.success) {
            statusP.innerText = '✅ Sync successfully!';
        } else {
            statusP.innerText = '❌ Sync failed!';
        }

    } catch (err) {
        statusP.innerText = '❌ ' + err.message;
    }
});