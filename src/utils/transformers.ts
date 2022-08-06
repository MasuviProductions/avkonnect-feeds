import { IFeed } from '../db/models/feeds';
import { IUserApiModel } from '../interfaces/api';

export const transformFeedsListToPostIdFeedsMap = (feeds: Array<IFeed>): Record<string, IFeed> => {
    const postIdFeedsMap: Record<string, IFeed> = {};
    feeds.forEach((feed) => {
        postIdFeedsMap[feed.postId] = feed;
    });
    return postIdFeedsMap;
};

export const transformFeedsListToSourceIdFeedsMap = (feeds: Array<IFeed>): Record<string, IFeed> => {
    const sourceIdFeedsMap: Record<string, IFeed> = {};
    feeds.forEach((feed) => {
        sourceIdFeedsMap[feed.sourceId] = feed;
    });
    return sourceIdFeedsMap;
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
