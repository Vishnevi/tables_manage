const sheetIdInput = document.querySelector("#sheetInputId");
const createLBBtn = document.querySelector("#createLBBtn");
const syncLBBtn = document.querySelector("#syncLBBtn");
const statusLB = document.querySelector("#statusLB");

let newSheetId1 = '';
let newSheetId2 = '';
let newSheetId3 = '';
let newSheetId4 = '';
let newSheetId5 = '';

createLBBtn.addEventListener("click", async () => {

    statusLB.innerText = 'Creating Sheet...';

    try {
        const response = await fetch('/create-LB', {
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

        if (result.success && result.url1 && result.url2 && result.url3 && result.url4 && result.url5) {
            statusLB.innerHTML = `
                ✅ Timeless Moment Sheet created: <a href="${result.url1}" target="_blank">Open it here</a><br>
                ✅ Beatlick Sheet created: <a href="${result.url2}" target="_blank">Open it here</a><br>
                ✅ HOROSHO Sheet created: <a href="${result.url3}" target="_blank">Open it here</a><br>
                ✅ Lostcolor Sheet created: <a href="${result.url4}" target="_blank">Open it here</a><br>
                ✅ Polyptych Sheet created: <a href="${result.url5}" target="_blank">Open it here</a>`
            newSheetId1 = result.url1.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
            newSheetId2 = result.url2.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
            newSheetId3 = result.url3.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
            newSheetId4 = result.url4.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
            newSheetId5 = result.url5.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
        } else {
            statusLB.innerText = '❌ Error creating sheet.';
        }

    } catch (err) {
        statusLB.innerText = '❌ ' + err.message;
    }
});



syncLBBtn.addEventListener("click", async () => {
   const sheetIdValue = sheetIdInput.value.trim();

   if (!sheetIdValue) {
       statusLB.innerText = 'Please enter a sheet id';
       return;
   }
   if (!newSheetId1 || !newSheetId2 || !newSheetId3 || !newSheetId4 || !newSheetId5) {
       statusLB.innerText = 'No created sheets! Create sheets first!';
   }

   statusLB.innerText = 'Syncing...';

   try {
       const response = await fetch('/sync-LB', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
           },
           body: JSON.stringify({
               sheetIdInput: sheetIdValue,
               sheetId1: newSheetId1,
               sheetId2: newSheetId2,
               sheetId3: newSheetId3,
               sheetId4: newSheetId4,
               sheetId5: newSheetId5
           })
       });

       if (response.status === 401) {
           localStorage.removeItem('auth_token');
           window.location.href = '/login.html';
           return;
       }

       const result = await response.json();


       if (result.success) {
           const { processedRows } = result;
           statusLB.innerHTML = `✅ Sync to Lime Blue successfully!<br>
               Timeless Moment: ${processedRows.sheet1} rows<br>
               Beatlick: ${processedRows.sheet2} rows<br>
               HOROSHO: ${processedRows.sheet3} rows<br>
               Lostcolor: ${processedRows.sheet4} rows<br>
               Polyptych: ${processedRows.sheet5} rows`;
       } else {
           statusLB.innerText = '❌ Sync to Lime Blue failed!';
       }

   } catch (err) {
       statusLB.innerText = '❌ ' + err.message;
   }
});

