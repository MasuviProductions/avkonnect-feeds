import axios from 'axios';
import API_ENDPOINTS from '../constants/api';
import { IPostApiModel } from '../interfaces/api';
import { HttpResponse } from '../interfaces/app';

const getPost = async (basicToken: string, postId: string): Promise<HttpResponse<IPostApiModel>> => {
    const post = await axios
        .get<HttpResponse<IPostApiModel>>(API_ENDPOINTS.GET_POST(postId), {
            headers: { authorization: `Basic ${basicToken}` },
        })
        .then((res) => res.data);
    return post;
};

const AVKONNECT_POSTS_SERVICE = {
    getPost,
};

export default AVKONNECT_POSTS_SERVICE;
