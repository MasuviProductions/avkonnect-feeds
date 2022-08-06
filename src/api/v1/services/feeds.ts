import { ObjectType } from 'dynamoose/dist/General';
import ENV from '../../../constants/env';
import { IFeed } from '../../../db/models/feeds';
import DB_QUERIES from '../../../db/queries';
import { HttpDynamoDBResponsePagination, ISourceFeedApiModel, ISourceFeedApiResponse } from '../../../interfaces/app';
import AVKKONNECT_CORE_SERVICE from '../../../services/avkonnect-core';
import AVKONNECT_POSTS_SERVICE from '../../../services/avkonnect-post';
import { transformFeedsListToPostIdFeedsMap, transformUsersListToUserIdUserMap } from '../../../utils/transformers';

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
    const postsInfo = await AVKONNECT_POSTS_SERVICE.getPostsInfo(ENV.AUTH_SERVICE_KEY, sourceId, new Set(postIds));
    const postIdToFeedMap = transformFeedsListToPostIdFeedsMap(sourceFeeds.documents as Array<IFeed>);
    const sourceIds = new Set<string>();
    sourceFeeds.documents?.forEach((feed) => {
        feed.feedSources?.forEach((feedSource) => {
            sourceIds.add(feedSource.sourceId);
        });
    });
    const relatedUsers = await AVKKONNECT_CORE_SERVICE.getUsersInfo(ENV.AUTH_SERVICE_KEY, Array.from(sourceIds));
    const relatedUserIdUserMap = transformUsersListToUserIdUserMap(relatedUsers.data || []);
    const userFeedsWithPostInfo =
        postsInfo.data?.map(
            (postInfo) =>
                ({
                    ...postInfo,
                    feedId: postIdToFeedMap[postInfo.postId].id,
                    feedSourcesInfo: postIdToFeedMap[postInfo.postId].feedSources.map((feedSource) => ({
                        ...feedSource,
                        relatedSource: relatedUserIdUserMap[feedSource.sourceId],
                    })),
                } as ISourceFeedApiModel)
        ) || [];
    return { documents: userFeedsWithPostInfo, dDBPagination: sourceFeeds.dDBPagination };
};

const FEEDS_SERVICE = {
    getSourceFeeds,
};

export default FEEDS_SERVICE;
