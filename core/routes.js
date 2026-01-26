import createSheet from "../createSheetTools/createSheetRoutes.js";
import mergeToTrack from "../mergeToTrackTools/mergeToTrackRoutes.js";
import mergeToWorks from "../mergeToWorksTools/mergeToWorksRoutes.js";
import mergeToIPChain from "../mergeToIPChainTools/mergeToIPChainRoutes.js";


export default function routes(app){
    app.use('/create-sheet', createSheet);
    app.use('/sync-track', mergeToTrack);
    app.use('/sync-works', mergeToWorks);
    app.use('/sync-ipchain', mergeToIPChain);
}