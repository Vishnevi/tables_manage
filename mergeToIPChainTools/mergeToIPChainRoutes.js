import { Router } from "express";
import {mergeToIPChain} from "./mergeToIPChain.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const inputSheetId = req.body.sheetIdInput;
        const sheetIdWorks = req.body.sheetIdWorks;
        const isLabel = req.body.isLabel || false;
        const result = await mergeToIPChain(inputSheetId, sheetIdWorks, isLabel);

        if (!result.ok) {
            return res.status(400).json({
                success: false,
                errors: result.errors || [],
                error: result.error,
                message: result.message,
            });
        }

        res.status(200).json({ success: true, warnings: result.warnings || [] });
    } catch (err) {
        console.error('Error sync to IP Chain', err);
        res.status(400).json({ success: false, error: 'Something went wrong' });
    }
})

export default router;
