import {sheetIdInput} from "./script.js";
const createZvonkoBtn = document.querySelector('#createZvonkoBtn');
const syncZvonkoBtn = document.querySelector('#syncZvonkoBtn');
const statusZvonko = document.querySelector('#statusZvonko');

let newZvonkoSheetId = '';

createZvonkoBtn.addEventListener('click', async () => {

    statusZvonko.innerText = 'Creating Zvonko Sheet...';

    try {
        const response = await fetch('/create-zvonko', {
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

        if (result.success && result.urlZvonko) {
            statusZvonko.innerHTML = `✅ Zvonko Sheet created: <a href="${result.urlZvonko}" target="_blank">Open it here</a>`;
            newZvonkoSheetId = result.urlZvonko.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
        } else {
            statusZvonko.innerText = '❌ Error creating Zvonko sheet.';
        }

    } catch (err) {
        statusZvonko.innerText = '❌ ' + err.message;
    }
});

syncZvonkoBtn.addEventListener('click', async () => {
    const sheetIdValue = sheetIdInput.value.trim();

    if (!sheetIdValue) {
        statusZvonko.innerText = 'Please enter a sheet id';
        return;
    }
    if (!newZvonkoSheetId) {
        statusZvonko.innerText = 'No created Zvonko sheet! Create sheet first!';
        return;
    }

    statusZvonko.innerText = 'Syncing...';

    try {
        const response = await fetch('/sync-zvonko', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({
                sheetIdInput: sheetIdValue,
                sheetIdZvonko: newZvonkoSheetId
            })
        });

        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login.html';
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            if (result.errors && Array.isArray(result.errors) && result.errors.length) {
                const zvonkoErrors = result.errors.map(err => {
                    if (err.type === 'missing-lastName') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message}`;
                    }
                    if (err.type === 'missing-firstName') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message}`;
                    }
                    if (err.type === 'missing-title') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'missing-isrc') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.title}"`;
                    }
                    if (err.type === 'duplicate-isrc') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} "${err.isrc}"`;
                    }
                    if (err.type === 'incorrect-share') {
                        return `Row ${err.row}, Column "${err.column}" - ${err.message} Expected: ${err.expected}, Actual: ${err.actual}`;
                    }
                }).join('<br>');
                statusZvonko.innerHTML = '❌ <b>Zvonko errors:</b><br>' + zvonkoErrors;
            } else {
                statusZvonko.innerText = '❌ Sync to Zvonko failed!';
            }
            return;
        }

        if (result.success) {
            statusZvonko.innerText = '✅ Sync to Zvonko successfully!';
        } else {
            statusZvonko.innerText = '❌ Sync to Zvonko failed!';
        }
    } catch (err) {
        statusZvonko.innerText = '❌ ' + err.message;
    }
});
