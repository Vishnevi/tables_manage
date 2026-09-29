const trackInput = document.querySelector("#trackInputId");
const worksInput = document.querySelector("#worksInputId");
const createMainBtn = document.querySelector("#createMainBtn");
const syncMainBtn = document.querySelector("#syncMainBtn");
const statusMain = document.querySelector("#statusMain");

let newMainSheetId = '';
let newMainSheetUrl = '';

createMainBtn.addEventListener("click", async () => {

    statusMain.innerText = 'Creating Sheet...';

    try {
        const response = await fetch('/create-main', {
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

        if (result.success && result.urlMain) {
            statusMain.innerHTML = `✅ Main Sheet created: <a href="${result.urlMain}" target="_blank">Open it here</a>`;
            newMainSheetId = result.urlMain.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
            newMainSheetUrl = result.urlMain;
        } else {
            statusMain.innerText = '❌ Error creating sheet.';
        }

    } catch (err) {
        statusMain.innerText = '❌ ' + err.message;
    }
});


syncMainBtn.addEventListener("click", async () => {
    const trackIdValue = trackInput.value.trim();
    const worksIdValue = worksInput.value.trim();

    if (!trackIdValue || !worksIdValue) {
        statusMain.innerText = 'Please enter Track and Works sheet ids!';
        return;
    }
    if (!newMainSheetId) {
        statusMain.innerText = 'No created sheet! Create sheet first!';
        return;
    }

    statusMain.innerText = 'Syncing...';

    try {
        const response = await fetch('/sync-main', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify({
                sheetIdTrack: trackIdValue,
                sheetIdWorks: worksIdValue,
                sheetIdMain: newMainSheetId
            })
        });

        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login.html';
            return;
        }

        const result = await response.json();

        if (result.success) {
            statusMain.innerHTML = `✅ Sync to Main successfully! ${result.processedRows} songs<br>
                📄 Main Sheet: <a href="${newMainSheetUrl}" target="_blank">Open it here</a>`;
        } else {
            statusMain.innerText = '❌ Sync to Main failed!';
        }

    } catch (err) {
        statusMain.innerText = '❌ ' + err.message;
    }
});
