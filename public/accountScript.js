const FIELDS = ['firstName', 'lastName', 'email', 'lang', 'login', 'earningsName', 'address', 'city', 'postalCode', 'country'];

const accountForm = document.querySelector("#accountForm");
const statusAccount = document.querySelector("#statusAccount");
const accountResult = document.querySelector("#accountResult");
const applicationOutput = document.querySelector("#applicationOutput");
const accountOutput = document.querySelector("#accountOutput");

accountForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {};
    FIELDS.forEach((field) => {
        data[field] = document.querySelector(`#${field}`).value.trim();
    });

    const missing = FIELDS.filter(field => !data[field]);
    if (missing.length) {
        statusAccount.innerText = `Please fill: ${missing.join(', ')}`;
        return;
    }

    statusAccount.innerText = 'Generating...';
    accountResult.hidden = true;

    try {
        const response = await fetch('/generate-account', {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
            body: JSON.stringify(data)
        });

        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login.html';
            return;
        }

        const result = await response.json();

        if (result.success) {
            applicationOutput.textContent = result.application;
            accountOutput.textContent = result.account;
            accountResult.hidden = false;
            statusAccount.innerText = '✅ Generated';
        } else {
            statusAccount.innerText = '❌ ' + (result.message || 'Error generating account');
        }

    } catch (err) {
        statusAccount.innerText = '❌ ' + err.message;
    }
});

document.querySelectorAll(".copyBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const text = document.querySelector(`#${btn.dataset.target}`).textContent;
        await navigator.clipboard.writeText(text);
        btn.innerText = 'Copied';
        setTimeout(() => btn.innerText = 'Copy', 1500);
    });
});
