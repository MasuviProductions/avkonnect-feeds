import { ObjectType } from 'dynamoose/dist/General';
import { feedsEventProcessor } from '../../../events/services/feeds';
import { IPostsInfoResponse } from '../../../interfaces/api';
import {
    HttpResponse,
    IFeedsEventRecord,
    ISourceFeedApiModel,
    ISourceFeedApiResponse,
    ITrendingFeeds,
    IUserFeeds,
    RequestHandler,
} from '../../../interfaces/app';
import FEEDS_SERVICE from '../services/feeds';

//need to mesh the data
/**
 *  Reference while reviewing
 *  1.get from source feeds whihc will have information of the posts etc.
 *  2.get data from trending posts.
 *  3.after receieving these datas use it to add it for a .
 *  4.we'll also check if user is autherised or not if not then we'll send him to only trending posts.
 */

export const managedFeedsForUser: RequestHandler<{
    Params: { userId: string };
    Querystring: { limit: string; nextSearchStartFromKey: string };
}> = async (request, reply) => {
    const {
        params: { userId },
        query: { limit, nextSearchStartFromKey },
    } = request;
    const nextSearchStartFromKeyDecodeddJson = nextSearchStartFromKey
        ? (JSON.parse(decodeURI(nextSearchStartFromKey)) as ObjectType)
        : undefined;
    //refactor the code and the the limit 0 issue, compute for the reaction in SQS
    const userFeedsLimit = Math.round(parseInt(limit) * 0.7);
    const trendingPostsLimit = parseInt(limit) - userFeedsLimit;
    //limit 1 means send 1 and 10 means 10

    let userFeeds: IUserFeeds;
    let trendingFeeds: ITrendingFeeds | undefined;

    if (parseInt(limit) === 1) {
        userFeeds = await FEEDS_SERVICE.getSourceFeeds(
            userId,
            userFeedsLimit,
            nextSearchStartFromKeyDecodeddJson?.nextSearchStartFromKeyUser
        );
    } else {
        [userFeeds, trendingFeeds] = await Promise.all([
            FEEDS_SERVICE.getSourceFeeds(
                userId,
                userFeedsLimit,
                nextSearchStartFromKeyDecodeddJson?.nextSearchStartFromKeyUser
            ),
            FEEDS_SERVICE.getTrendingPost(
                trendingPostsLimit,
                nextSearchStartFromKeyDecodeddJson?.nextSearchStartFromKeyTrending
            ),
        ]);
    }

    if (userFeeds.documents.feeds.length === 0) {
        //dont forget to change this condition after the logic
        const modifiedLimit = parseInt(limit) - trendingPostsLimit;
        const nextKeyTrending = trendingFeeds?.dDBPagination?.nextSearchStartFromKey;
        const temp = await FEEDS_SERVICE.getTrendingPost(modifiedLimit, nextKeyTrending);
        if (trendingFeeds?.documents && temp.documents) {
            trendingFeeds.documents.postsInfo = trendingFeeds?.documents?.postsInfo.concat(temp?.documents?.postsInfo);
        }

        if (temp.dDBPagination && trendingFeeds?.documents) {
            trendingFeeds.dDBPagination.nextSearchStartFromKey = temp.dDBPagination.nextSearchStartFromKey;
            // trendingFeeds.dDBPagination.count = trendingFeeds.documents?.postsInfo.length;
        }
    }
    const feedsForTrendingPosts: ISourceFeedApiModel[] =
        trendingFeeds?.documents?.postsInfo.map((postInfo) => ({
            ...postInfo,
            feedId: postInfo.postId,
            feedSources: [],
        })) || [];

    userFeeds.documents.feeds = userFeeds.documents.feeds.concat(feedsForTrendingPosts);

    // console.log(feedsForTrendingPosts.length);

    /**
     * NOTE TO FUTURE:
     * 1.getSource feeds can be used to show user not only the activity of their peers.
     * but to generate feeds specifcally for users that they are more affiniated to engage upon depending signals,
     * 2.This endpoint (getSource feeds) can be redeveloped for this use case.
     * 3.the trending post can be more localised to show more creator on the rise for a specific location or for a particular segment.
     */

    const nextSearchStartFromKeyUser = userFeeds?.dDBPagination.nextSearchStartFromKey;
    const nextSearchStartFromKeyTrending =
        trendingFeeds && 'nextSearchStartFromKey' in trendingFeeds.dDBPagination
            ? trendingFeeds?.dDBPagination.nextSearchStartFromKey
            : undefined;

    const searchNextFeedData = {
        nextSearchStartFromKeyUser,
        nextSearchStartFromKeyTrending,
    };
    const response: HttpResponse<ISourceFeedApiResponse | IPostsInfoResponse> = {
        success: true,
        data: { ...userFeeds.documents },
        dDBPagination: {
            count:
                (userFeeds && userFeeds.dDBPagination ? userFeeds.dDBPagination.count : 0) +
                (trendingFeeds && trendingFeeds.dDBPagination ? trendingFeeds.dDBPagination.count : 0),
            nextSearchStartFromKey: searchNextFeedData,
        },
    };

    reply.status(200).send(response);
};

export const getFeedsForUser: RequestHandler<{
    Params: { userId: string };
    Querystring: { limit: number; nextSearchStartFromKey: string };
}> = async (request, reply) => {
    const {
        params: { userId },
        query: { limit, nextSearchStartFromKey },
    } = request;
    const userFeeds = await FEEDS_SERVICE.getSourceFeeds(
        userId,
        limit,
        nextSearchStartFromKey ? (JSON.parse(decodeURI(nextSearchStartFromKey)) as ObjectType) : undefined
    );
    const response: HttpResponse<ISourceFeedApiResponse> = {
        success: true,
        data: userFeeds.documents,
        dDBPagination: userFeeds.dDBPagination,
    };
    reply.status(200).send(response);
};

export const getTrendingPosts: RequestHandler<{
    Querystring: { limit: number; nextSearchStartFromKey: string };
}> = async (request, reply) => {
    const {
        query: { limit, nextSearchStartFromKey },
    } = request;
    const trendsPostIds = await FEEDS_SERVICE.getTrendingPost(
        limit,
        nextSearchStartFromKey ? (JSON.parse(decodeURI(nextSearchStartFromKey)) as ObjectType) : undefined
    );
    if (!trendsPostIds) {
        return undefined;
    }
    const response: HttpResponse<IPostsInfoResponse> = {
        success: true,
        data: trendsPostIds.documents,
        dDBPagination: trendsPostIds.dDBPagination,
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
