const sheetIdInput = document.querySelector("#sheetId");
const createBtn = document.querySelector("#createBtn");
const statusP = document.querySelector("#status");


createBtn.addEventListener("click", async () => {
    const sheetIdValue = sheetIdInput.value.trim();

    if (!sheetIdValue) statusP.innerText = "Please enter a sheet id!";

    statusP.innerText = "Wait plz...";

    try {
        const response = await fetch('/create-sheet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({sheetId: sheetIdValue})
        });

        const result = await response.json();

        if (result.success && result.url) statusP.innerHTML = `✅ Sheet created: <a href="${result.url}" target="_blank">Open it here</a>`;
        else statusP.innerText = '❌ Error creating sheet.';
    } catch (err) {
        statusP.innerText = '❌ ' + err.message;
    }
})