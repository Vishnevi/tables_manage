import createSheet from "../createSheetTools/createSheetRoutes.js";
import mergeToTrack from "../mergeToTrackTools/mergeToTrackRoutes.js";
import mergeToWorks from "../mergeToWorksTools/mergeToWorksRoutes.js";
import mergeToIPChain from "../mergeToIPChainTools/mergeToIPChainRoutes.js";
import authRoutes from "../auth/authRoutes.js";
import createZvonko from "../zvonkoTools/createSheetZvonkoTools/createZvonkoRoutes.js";
import mergeToZvonko from "../zvonkoTools/mergeZvonkoTools/mergeToZvonkoRoutes.js";
import createLB from "../limeBlueTools/createLimeBlueTools/createLimeBlueRoutes.js";
import mergeLB from "../limeBlueTools/mergeToLimeBlueTools/mergeToLimeBlueRoutes.js"
import { verifyToken } from "../auth/authMiddleware.js";


export default function routes(app){
    app.use('/api', authRoutes);
    app.use('/create-sheet', verifyToken, createSheet);
    app.use('/sync-track', verifyToken, mergeToTrack);
    app.use('/sync-works', verifyToken, mergeToWorks);
    app.use('/sync-ipchain', verifyToken, mergeToIPChain);
    app.use('/create-zvonko', verifyToken, createZvonko);
    app.use('/sync-zvonko', verifyToken, mergeToZvonko);
    app.use('/create-LB', verifyToken, createLB);
    app.use('/sync-LB', verifyToken, mergeLB);
}