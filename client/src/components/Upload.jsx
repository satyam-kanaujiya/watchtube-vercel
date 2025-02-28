import api from '../api.js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import {toast} from 'react-hot-toast';

const Container = styled.div({
    width:"100%",
    height:"100%",
    position:"fixed",
    top:"0px",
    left:"0px",
    backgroundColor:"#000000a7",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
});
const Wrapper = styled.div(props=>({
    width:"500px",
    height:"530px",
    backgroundColor:props.theme.mainBg,
    color:props.theme.mainText,
    padding:"20px",
    display:"flex",
    flexDirection:"column",
    gap:"20px",
    position:"relative"
}));
const Close = styled.div({
    position:"absolute",
    top:"10px",
    right:"10px",
    cursor:"pointer"
});
const Title = styled.h2({
    textAlign:"center",
    marginBottom:"10px"
});

const Input = styled.input(props=>({
    border:`1px solid gray`,
    color:props.theme.mainText,
    borderRadius:"5px",
    padding:"10px",
    backgroundColor:"transparent"
}));
const TextArea = styled.textarea(props=>({
    border:`1px solid gray`,
    color:props.theme.mainText,
    borderRadius:"5px",
    padding:"10px",
    backgroundColor:"transparent"
}));

const Button = styled.button(props=>({
    borderRadius:"3px",
    border:"none",
    padding:"6px 10px",
    fontWeight:500,
    cursor:"pointer",
    backgroundColor:props.theme.mainBg,
    color:props.theme.mainText
}));

const Label = styled.label({
    fontSize:"14px"
});

function Upload({setOpen}) {

  const navigate = useNavigate();

  const [videoUrl, setVideoUrl] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleTagsChange = (e) => setTags(e.target.value.split(","));

  const uploadToCloudinary = async (file, resourceType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    if(resourceType==='image'){
      formData.append("folder", "watchtube/images");
    }else{
      formData.append("folder", "watchtube/videos");
    }

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        formData
      );
      return response.data.secure_url; 
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadToCloudinary(file, type);
    if(type === "image") setImgUrl(url);
    if(type === "video") setVideoUrl(url);
  };

  const handleUpload = async () => {
    if (!videoUrl || !imgUrl || !title || !description || !tags) {
      alert("Please fill all fields and select both video and image!");
      return;
    }

    const data = {imgUrl,videoUrl,title,desc:description,tags};
    console.log(data);
    try {
      const response = await api.post("/videos", data, {withCredentials:true});
      console.log("Upload Successful:", response);
      toast.success("upload successfull");
      setOpen(false);
      response.status===201 && navigate(`/video/${response.data?.data?.video?._id}`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("uploadation failed!");
    } finally {
    }
  };

  return (
    <Container>
        <Wrapper>
            <Close onClick={()=>setOpen(false)}>X</Close>
            <Title>Upload a New Video</Title>
            <Label>Video:</Label>
            <Input type="file" accept='video/*' onChange={e=>handleFileChange(e,"video")}/>
            <Input type="text" placeholder="Title" value={title} onChange={handleTitleChange}/>
            <TextArea placeholder='Description' rows={8} value={description} onChange={handleDescriptionChange}/>
            <Input type="text" placeholder="Seperate tags with commas." value={tags} onChange={handleTagsChange}/>
            <Label>Image:</Label>
            <Input type="file" accept="image/*" onChange={e=>handleFileChange(e,"image")}/>
            <Button onClick={handleUpload} disabled={!videoUrl || !imgUrl}>Upload</Button>
        </Wrapper>
    </Container>
  )
}

export default Upload