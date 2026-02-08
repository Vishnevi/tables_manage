import { Router } from "express";
import {createZvonko} from "./createZvonko.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const urlZvonko = await createZvonko();
        res.json({ success: true, urlZvonko });
    } catch (err) {
        console.error('Error creating Zvonko sheet:', err);
        res.status(500).json({ success: false, error: 'Error creating Zvonko sheet' });
    }
});

export default router;