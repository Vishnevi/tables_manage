import { Router } from "express";
import {createMainSheet} from "../../createSheetTools/createSheet.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const urlMain = await createMainSheet();
        res.json({ success: true, urlMain });
    } catch (err) {
        console.error('Error creating Main sheet:', err);
        res.status(500).json({ success: false, error: 'Error creating Main sheet' });
    }
});

export default router;
