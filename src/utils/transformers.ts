import { IFeed } from '../db/models/feeds';
import { IUserApiModel } from '../interfaces/api';

export const transformFeedsListToPostIdFeedsMap = (feeds: Array<IFeed>): Record<string, IFeed> => {
    const postIdFeedsMap: Record<string, IFeed> = {};
    feeds.forEach((feed) => {
        postIdFeedsMap[feed.postId] = feed;
    });
    return postIdFeedsMap;
};

export const transformFeedsListToUserIdFeedsMap = (feeds: Array<IFeed>): Record<string, IFeed> => {
    const userIdFeedsMap: Record<string, IFeed> = {};
    feeds.forEach((feed) => {
        userIdFeedsMap[feed.userId] = feed;
    });
    return userIdFeedsMap;
};

export const transformUsersListToUserIdUserMap = (
    users: Array<Partial<IUserApiModel>>
): Record<string, Partial<IUserApiModel>> => {
    const userIdUsersMap: Record<string, Partial<IUserApiModel>> = {};
    users.forEach((user) => {
        userIdUsersMap[user.id as string] = user;
    });
    return userIdUsersMap;
};
