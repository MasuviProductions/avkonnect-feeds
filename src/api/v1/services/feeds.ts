import { ObjectType } from 'dynamoose/dist/General';
import ENV from '../../../constants/env';
import { IFeed } from '../../../db/models/feeds';
import DB_QUERIES from '../../../db/queries';
import { HttpDynamoDBResponsePagination, ISourceFeedApiModel, ISourceFeedApiResponse } from '../../../interfaces/app';
import AVKKONNECT_CORE_SERVICE from '../../../services/avkonnect-core';
import AVKONNECT_POSTS_SERVICE from '../../../services/avkonnect-post';
import { transformFeedsListToPostIdFeedsMap } from '../../../utils/transformers';

const getSourceFeeds = async (
    sourceId: string,
    limit: number,
    nextSearchStartFromKey?: ObjectType
): Promise<{
    documents: ISourceFeedApiResponse;
    dDBPagination: HttpDynamoDBResponsePagination;
}> => {
    const sourceFeeds = await DB_QUERIES.getSourceFeeds(sourceId, limit, nextSearchStartFromKey);
    const postIds = sourceFeeds.documents?.map((feed) => feed.postId as string);
    const postsInfo = await AVKONNECT_POSTS_SERVICE.getPostsInfo(ENV.AUTH_SERVICE_KEY, new Set(postIds), sourceId);

    const postIdToFeedMap = transformFeedsListToPostIdFeedsMap(sourceFeeds.documents as Array<IFeed>);
    const sourceIds = new Set<string>();
    sourceFeeds.documents?.forEach((feed) => {
        feed.feedSources?.forEach((feedSource) => {
            sourceIds.add(feedSource.sourceId);
        });
    });
    // NOTE: Remove userIds from list to prevent fetching duplicate values for relatedSources
    postsInfo.data?.relatedSources?.forEach((relatedUser) => {
        // NOTE: Doesn't matter if return value is true or false. Delete only if it exists
        sourceIds.delete(relatedUser.id as string);
    });
    const sourceUsersRes = await AVKKONNECT_CORE_SERVICE.getUsersInfo(ENV.AUTH_SERVICE_KEY, Array.from(sourceIds));
    const userFeedsWithPostInfo =
        postsInfo.data?.postsInfo.map(
            (postInfo) =>
                ({
                    ...postInfo,
                    feedId: postIdToFeedMap[postInfo.postId].id,
                    feedSources: postIdToFeedMap[postInfo.postId].feedSources,
                } as ISourceFeedApiModel)
        ) || [];

    const feedsInfo: ISourceFeedApiResponse = {
        feeds: userFeedsWithPostInfo,
        relatedSources: [...(postsInfo.data?.relatedSources || []), ...(sourceUsersRes.data || [])],
    };
    return { documents: feedsInfo, dDBPagination: sourceFeeds.dDBPagination };
};

const getTrendingPost = async (limit: number, nextSearchStartFromKey?: ObjectType, userId?: string) => {
    const postsWeight = await DB_QUERIES.scanTrendingPosts(limit, nextSearchStartFromKey);
    const postIds = postsWeight.documents?.map((post) => post.postId as string);
    const postsInfo = await AVKONNECT_POSTS_SERVICE.getPostsInfo(ENV.AUTH_SERVICE_KEY, new Set(postIds), userId);
    return { documents: postsInfo.data, dDBPagination: postsWeight.dDBPagination };
};

const FEEDS_SERVICE = {
    getSourceFeeds,
    getTrendingPost,
};

export default FEEDS_SERVICE;
