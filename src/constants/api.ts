import ENV from './env';

const AVKONNECT_URL = {
    CORE: ENV.AVKONNECT_CORE_URL,
    POSTS: ENV.AVKONNECT_POSTS_URL,
};

const API_ENDPOINTS = {
    GET_AUTH_USER: (): string => `${AVKONNECT_URL.CORE}/api/v1/auth/user`,
    GET_CONNECTION: (connectionId: string): string => `${AVKONNECT_URL.CORE}/api/v1/connections/${connectionId}`,
    GET_CONNECTIONS: (userId: string, queryString: string): string =>
        `${AVKONNECT_URL.CORE}/api/v1/users/${userId}/connections?${queryString}`,
    GET_USERS_INFO: (): string => `${AVKONNECT_URL.CORE}/api/v1/users/getUsersInfo`,
    GET_USER: (userId: string): string => `${AVKONNECT_URL.CORE}/api/v1/users/${userId}`,
    GET_POST: (postId: string): string => `${AVKONNECT_URL.POSTS}/api/posts/v1/posts/${postId}`,
    GET_POSTS_INFO: (): string => `${AVKONNECT_URL.POSTS}/api/posts/v1/posts/getPostsInfo`,
    GET_COMMENT: (commentId: string): string => `${AVKONNECT_URL.POSTS}/api/posts/v1/comments/${commentId}`,
    GET_REACTION: (reactionId: string): string => `${AVKONNECT_URL.POSTS}/api/posts/v1/reactions/${reactionId}`,
    GET_TRENDING_POST: (): string => `${AVKONNECT_URL.POSTS}/api/posts/v1/posts/trending`,
    GET_POST_ACTIVITY: (resourceId: string): string =>
        `${AVKONNECT_URL.POSTS}/api/posts/v1/posts/${resourceId}/trending`,
};

export default API_ENDPOINTS;
