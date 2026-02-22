import { Router } from "express";
import {createLB1, createLB2, createLB3, createLB4, createLB5} from "./createLimeBlue.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const url1 = await createLB1();
        const url2 = await createLB2();
        const url3 = await createLB3();
        const url4 = await createLB4();
        const url5 = await createLB5();
        res.json({ success: true, url1, url2, url3, url4, url5 });
    } catch (err) {
        console.error('Error creating sheet:', err);
        res.status(500).json({ success: false, error: 'Error creating sheet' });
    }
});

export default router;