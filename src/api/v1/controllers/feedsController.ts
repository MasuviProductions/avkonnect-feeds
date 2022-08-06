import { ObjectType } from 'dynamoose/dist/General';
import { feedsEventProcessor } from '../../../events/services/feeds';
import { HttpResponse, IFeedsEventRecord, ISourceFeedApiResponse, RequestHandler } from '../../../interfaces/app';
import FEEDS_SERVICE from '../services/feeds';

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
