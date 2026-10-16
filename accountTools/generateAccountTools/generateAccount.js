import bcrypt from "bcryptjs";
import crypto from "crypto";

const FIELDS = ['firstName', 'lastName', 'email', 'lang', 'login', 'earningsName', 'address', 'city', 'postalCode', 'country'];

function str(value) {
    return JSON.stringify(value);
}

export async function generateAccount(body) {
    const data = {};

    FIELDS.forEach((field) => {
        data[field] = typeof body?.[field] === 'string' ? body[field].trim() : '';
    });

    const missing = FIELDS.filter(field => !data[field]);
    if (missing.length) {
        return {ok: false, error: 'MISSING_FIELDS', message: `Empty fields: ${missing.join(', ')}`};
    }

    const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);

    const application = `{
    firstName: ${str(data.firstName)},
    lastName: ${str(data.lastName)},
    email: ${str(data.email)},
    dob: "1990-09-09",
    lang: ${str(data.lang)},
    status: "approved",
    remindersOff: true,
    createdAt: new Date(),
    updatedAt: new Date()
}`;

    const account = `{
    application: ObjectId(""),
    login: ${str(data.login)},
    email: ${str(data.email)},
    passwordHash: ${str(passwordHash)},
    firstName: ${str(data.firstName)},
    lastName: ${str(data.lastName)},
    firstNameEn: ${str(data.firstName)},
    lastNameEn: ${str(data.lastName)},
    earningsName: ${str(data.earningsName)},
    address: ${str(data.address)},
    city: ${str(data.city)},
    postalCode: ${str(data.postalCode)},
    country: ${str(data.country)},
    addressEn: ${str(data.address)},
    lang: ${str(data.lang)},
    emailVerified: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
}`;

    return {ok: true, application, account};
}
