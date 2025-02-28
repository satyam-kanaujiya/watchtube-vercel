import {Video} from '../models/video.model.js';
import {User} from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const getVideo = asyncHandler(async(req,res)=>{

    const video = await Video.findById(req.params.id);
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    res.status(200).json(new ApiResponse("video fetched successfully",{video}));
});

const addVideo = asyncHandler(async(req,res)=>{

    const {imgUrl,videoUrl} = req.body;

    if(!imgUrl || !videoUrl){
        throw new ApiError(404,"Image or Video url missing");
    }

    const video = await Video.create({userId:req.user._id,imgUrl,videoUrl,...req.body});

    if(!video){
        throw new ApiError(500,"Video Uploadation failed!");
    }

    res.status(201).json(new ApiResponse("Video creation successful",{video}));
});

const updateVideo = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const video = await Video.findById(id);
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    if(!(req.user._id.toString()==video.userId.toString())){
        throw new ApiError(401,"You cannot update someone else's video");
    }

    const updatedVideo = await Video.findByIdAndUpdate(id,req.body,{new:true,runValidators:true});

    if(!updatedVideo){
        throw new ApiError(500,"Video updation failed please try again");
    }

    res.status(201).json(new ApiResponse("Movie updation successfull",{video:updatedVideo}));
    
}); 

const updateViews = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    if(!id){
        throw new ApiError(400,"Unavailabe ID");
    }
    const video = await Video.findByIdAndUpdate(id,{$inc:{views:1}},{new:true});
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    res.status(200).json(new ApiResponse("views increased successfully",{video}));
});

const trendingVideos = asyncHandler(async(req,res)=>{
    const videos = await Video.find().sort({views:-1}).limit(10);
    if(!videos){
        throw new ApiError(500,"Unable to fetch trending video");
    }
    if(videos.length === 0){
        throw new ApiError(500,"Currently we have no videos to show");
    }

    res.status(200).json(new ApiResponse("fetched treanding videos",{videos}));
});

const randomVideos = asyncHandler(async(req,res)=>{
    
    const videos = await Video.aggregate([{$sample:{size:40}}]);
    if(!videos || videos?.length < 1){
        throw new ApiError(404,"No Video available");
    }

    res.status(200).json(new ApiResponse("Fetched random videos",{videos}));
});

const allSubsribedVideos = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);

    const {subscribedChannels} = user;
    const list = await Promise.all(
        subscribedChannels.map((channelId)=>{
            return Video.find({userId:channelId}).sort("-createdAt");
        })
    );
    const flatedList = list.flat().sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(new ApiResponse("fetched all subscribed videos",{videos:flatedList}));
}); 

const getByTags = asyncHandler(async(req,res)=>{
    const tags = req.query.tags.split(",");
    const videos = await Video.find({tags:{$in:tags}}).limit(10);
    res.status(200).json(new ApiResponse("videos fetched based on tags",{videos}));
});

const searchVideos = asyncHandler(async(req,res)=>{
    const q = req.query.q;
    const videos = await Video.find({title:{$regex:q,$options:"i"}});
    if(videos.length === 0){
        throw new ApiError(404,"No video found");
    }
    res.status(200).json(new ApiResponse("fetched search videos successfully",{videos}));
});



export {getVideo,addVideo,updateVideo,updateViews,trendingVideos,randomVideos,allSubsribedVideos,getByTags,searchVideos};