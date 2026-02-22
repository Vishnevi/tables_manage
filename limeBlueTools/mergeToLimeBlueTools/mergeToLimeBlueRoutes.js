import { Router } from "express";
import { mergeLB1, mergeLB2, mergeLB3, mergeLB4, mergeLB5 } from "./mergeToLimeBlue.js";

const router = Router();

router.post('/', async (req, res) => {
    try {
        const inputSheetId = req.body.sheetIdInput;
        const sheetId1 = req.body.sheetId1;
        const sheetId2 = req.body.sheetId2;
        const sheetId3 = req.body.sheetId3;
        const sheetId4 = req.body.sheetId4;
        const sheetId5 = req.body.sheetId5;

        const result1 = await mergeLB1(inputSheetId, sheetId1);
        const result2 = await mergeLB2(inputSheetId, sheetId2);
        const result3 = await mergeLB3(inputSheetId, sheetId3);
        const result4 = await mergeLB4(inputSheetId, sheetId4);
        const result5 = await mergeLB5(inputSheetId, sheetId5);


        if (!result1.ok || !result2.ok || !result3.ok || !result4.ok || !result5.ok) {
            return res.status(400).json({
                success: false,
                error: result1.error || result2.error || result3.error || result4.error || result5.error,
                results: { result1, result2, result3, result4, result5 }
            });
        }

        res.status(200).json({
            success: true,
            processedRows: {
                sheet1: result1.processedRows || 0,
                sheet2: result2.processedRows || 0,
                sheet3: result3.processedRows || 0,
                sheet4: result4.processedRows || 0,
                sheet5: result5.processedRows || 0
            }
        });
    } catch (err) {
        console.error('Error sync to Lime Blue', err);
        res.status(400).json({ success: false, error: 'Something went wrong' });
    }
})

export default router;