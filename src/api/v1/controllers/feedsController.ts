import { feedsEventProcessor } from '../../../events/services/feeds';
import { HttpResponse, IFeedsEventRecord, RequestHandler } from '../../../interfaces/app';
import FEEDS_SERVICE from '../services/feeds';

export const getFeedsForUser: RequestHandler<{
    Params: { userId: string };
}> = async (request, reply) => {
    const {
        params: { userId },
    } = request;

    const userFeeds = await FEEDS_SERVICE.getUserFeeds(userId);

    const response: HttpResponse = {
        success: true,
        data: userFeeds,
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
