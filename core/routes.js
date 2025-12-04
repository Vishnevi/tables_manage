import createSheet from "../createSheetTools/createSheetRoutes.js";
import mergeToTrack from "../mergeToTrackTools/mergeToTrackRoutes.js";


export default function routes(app){
    app.use('/create-sheet', createSheet);
    app.use('/sync-track', mergeToTrack);
}