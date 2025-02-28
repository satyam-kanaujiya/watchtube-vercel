import axios from 'axios';

const api = axios.create({
    baseURL:"https://watchtube-vercel-backend.vercel.app/api/v1"
});

export default api;