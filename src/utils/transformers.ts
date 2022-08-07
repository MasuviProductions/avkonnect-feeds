import { IFeed } from '../db/models/feeds';

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
