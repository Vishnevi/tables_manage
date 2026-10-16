import { Router } from "express";
import {generateAccount} from "./generateAccount.js";

const router = Router();

router.post('/', async (req, res) => {
    res.set('Cache-Control', 'no-store');

    try {
        const result = await generateAccount(req.body);

        if (!result.ok) {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }

        res.status(200).json({ success: true, application: result.application, account: result.account });
    } catch (err) {
        console.error('Error generating account:', err.message);
        res.status(500).json({ success: false, error: 'Error generating account' });
    }
});

export default router;
