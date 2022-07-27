import { ObjectType } from 'dynamoose/dist/General';
import ENV from '../../../constants/env';
import { IFeed } from '../../../db/models/feeds';
import { feedsEventProcessor } from '../../../events/services/feeds';
import {
    HttpResponse,
    IFeedsEventRecord,
    IUserFeedApiModel,
    IUserFeedApiResponse,
    RequestHandler,
} from '../../../interfaces/app';
import AVKONNECT_POSTS_SERVICE from '../../../services/avkonnect-post';
import { transformFeedsListToPostIdFeedsMap } from '../../../utils/transformers';
import FEEDS_SERVICE from '../services/feeds';

export const getFeedsForUser: RequestHandler<{
    Params: { userId: string };
    Querystring: { limit: number; nextSearchStartFromKey: string };
}> = async (request, reply) => {
    const {
        params: { userId },
        query: { limit, nextSearchStartFromKey },
    } = request;

    const userFeeds = await FEEDS_SERVICE.getUserFeeds(
        userId,
        limit,
        nextSearchStartFromKey ? (JSON.parse(decodeURI(nextSearchStartFromKey)) as ObjectType) : undefined
    );

    const postIds = userFeeds.documents?.map((feed) => feed.postId as string);
    const postsInfo = await AVKONNECT_POSTS_SERVICE.getPostsInfo(ENV.AUTH_SERVICE_KEY, userId, new Set(postIds));
    const postIdToFeedMap = transformFeedsListToPostIdFeedsMap(userFeeds.documents as Array<IFeed>);

    const userFeedsWithPostInfo = postsInfo.data?.map(
        (postInfo) =>
            ({
                ...postInfo,
                feedId: postIdToFeedMap[postInfo.postId].id,
            } as IUserFeedApiModel)
    );

    const response: HttpResponse<IUserFeedApiResponse> = {
        success: true,
        data: userFeedsWithPostInfo,
        dDBPagination: userFeeds.dDBPagination,
    };
    reply.status(200).send(response);
};

export const feedGenerateSampleEvent: RequestHandler<{
    Body: IFeedsEventRecord;
}> = async (request, reply) => {
    const { body } = request;

    await feedsEventProcessor(body);
    const response: HttpResponse = {
        success: true,
        data: 'done',
    };
    reply.status(200).send(response);
};
feedsEventProcessor;
