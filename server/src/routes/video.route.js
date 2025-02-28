import {Router} from 'express';
import { addVideo, allSubsribedVideos, getByTags, getVideo, randomVideos, searchVideos, trendingVideos, updateVideo, updateViews } from '../controllers/video.controller.js';
import verifyJwt from '../middlewares/verifyJwt.js';
const router = Router();

router.route("/trend").get(trendingVideos);
router.route("/random").get(randomVideos);
router.route("/sub").get(verifyJwt,allSubsribedVideos);
router.route("/tags").get(getByTags);
router.route("/search").get(searchVideos);
router.route("/:id").get(getVideo).put(verifyJwt,updateVideo);
router.route("/").post(verifyJwt,addVideo);
router.route("/view/:id").put(updateViews);

export default router;