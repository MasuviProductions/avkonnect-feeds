import axios, { AxiosResponse } from 'axios';
import API_ENDPOINTS from '../constants/api';
import { IPostApiModel, IPostsInfoRequest, IPostsInfoResponse } from '../interfaces/api';
import { HttpResponse } from '../interfaces/app';

const getPost = async (basicToken: string, postId: string): Promise<HttpResponse<IPostApiModel>> => {
    const post = await axios
        .get<HttpResponse<IPostApiModel>>(API_ENDPOINTS.GET_POST(postId), {
            headers: { authorization: `Basic ${basicToken}` },
        })
        .then((res) => res.data);
    return post;
};

const getPostsInfo = async (
    basicToken: string,
    userId: string,
    postIds: Set<string>
): Promise<HttpResponse<IPostsInfoResponse>> => {
    const posts = await axios
        .post<IPostsInfoRequest, AxiosResponse<HttpResponse<IPostsInfoResponse>>>(
            API_ENDPOINTS.GET_POSTS_INFO(),
            {
                userId: userId,
                postIds: Array.from(postIds),
            },
            {
                headers: { authorization: `Basic ${basicToken}` },
            }
        )
        .then((res) => res.data);
    return posts;
};

const AVKONNECT_POSTS_SERVICE = {
    getPost,
    getPostsInfo,
};

export default AVKONNECT_POSTS_SERVICE;
