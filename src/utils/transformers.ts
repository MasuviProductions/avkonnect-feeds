import { IFeed } from '../db/models/feeds';

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
