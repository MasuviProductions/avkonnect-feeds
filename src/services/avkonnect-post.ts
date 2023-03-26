import axios, { AxiosResponse } from 'axios';
import API_ENDPOINTS from '../constants/api';
import {
    IActivityApiModel,
    ICommentApiModel,
    IPostApiModel,
    IPostsInfoRequest,
    IPostsInfoResponse,
    IReactionApiModel,
} from '../interfaces/api';
import { HttpResponse } from '../interfaces/app';

const getPostActivity = async (basicToken: string, resourceId: string): Promise<HttpResponse<IActivityApiModel>> => {
    const posts = await axios
        .post<HttpResponse<IActivityApiModel>>(API_ENDPOINTS.GET_POST_ACTIVITY(resourceId), {
            headers: { authorization: `Basic ${basicToken}` },
        })
        .then((res) => res.data);
    return posts;
};

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
    postIds: Set<string>,
    userId?: string
): Promise<HttpResponse<IPostsInfoResponse>> => {
    const posts = await axios
        .post<IPostsInfoRequest, AxiosResponse<HttpResponse<IPostsInfoResponse>>>(
            API_ENDPOINTS.GET_POSTS_INFO(),
            {
                sourceId: userId,
                sourceType: 'user',
                postIds: Array.from(postIds),
            },
            {
                headers: { authorization: `Basic ${basicToken}` },
            }
        )
        .then((res) => res.data);
    return posts;
};

const getComment = async (basicToken: string, commentId: string): Promise<HttpResponse<ICommentApiModel>> => {
    const comment = await axios
        .get<HttpResponse<ICommentApiModel>>(API_ENDPOINTS.GET_COMMENT(commentId), {
            headers: { authorization: `Basic ${basicToken}` },
        })
        .then((res) => res.data);

    return comment;
};

const getReaction = async (basicToken: string, reactionId: string): Promise<HttpResponse<IReactionApiModel>> => {
    const reaction = await axios
        .get<HttpResponse<IReactionApiModel>>(API_ENDPOINTS.GET_REACTION(reactionId), {
            headers: { authorization: `Basic ${basicToken}` },
        })
        .then((res) => res.data);

    return reaction;
};

const AVKONNECT_POSTS_SERVICE = {
    getPost,
    getPostsInfo,
    getComment,
    getReaction,
    getPostActivity,
};

export default AVKONNECT_POSTS_SERVICE;
