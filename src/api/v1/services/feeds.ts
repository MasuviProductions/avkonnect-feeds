import { ObjectType } from 'dynamoose/dist/General';
import ENV from '../../../constants/env';
import { IFeed } from '../../../db/models/feeds';
import DB_QUERIES from '../../../db/queries';
import { HttpDynamoDBResponsePagination, IUserFeedApiModel, IUserFeedApiResponse } from '../../../interfaces/app';
import AVKONNECT_POSTS_SERVICE from '../../../services/avkonnect-post';
import { transformFeedsListToPostIdFeedsMap } from '../../../utils/transformers';

const getUserFeeds = async (
    userId: string,
    limit: number,
    nextSearchStartFromKey?: ObjectType
): Promise<{
    documents: IUserFeedApiResponse;
    dDBPagination: HttpDynamoDBResponsePagination;
}> => {
    const userFeeds = await DB_QUERIES.getUserFeeds(userId, limit, nextSearchStartFromKey);

    const postIds = userFeeds.documents?.map((feed) => feed.postId as string);
    const postsInfo = await AVKONNECT_POSTS_SERVICE.getPostsInfo(ENV.AUTH_SERVICE_KEY, userId, new Set(postIds));
    const postIdToFeedMap = transformFeedsListToPostIdFeedsMap(userFeeds.documents as Array<IFeed>);

    const userFeedsWithPostInfo =
        postsInfo.data?.map(
            (postInfo) =>
                ({
                    ...postInfo,
                    feedId: postIdToFeedMap[postInfo.postId].id,
                    feedSource: postIdToFeedMap[postInfo.postId].feedSources,
                } as IUserFeedApiModel)
        ) || [];

    return { documents: userFeedsWithPostInfo, dDBPagination: userFeeds.dDBPagination };
};

const FEEDS_SERVICE = {
    getUserFeeds,
};

export default FEEDS_SERVICE;
