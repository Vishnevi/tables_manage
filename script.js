const sheetIdInput = document.querySelector("#sheetId");
const createBtn = document.querySelector("#createBtn");
const statusP = document.querySelector("#status");


createBtn.addEventListener("click", async () => {
    const sheetIdValue = sheetIdInput.value;

    if (!sheetIdValue) statusP.innerText = "Please enter a sheet id!";
    else statusP.innerText = "Wait plz...";
})