import { ObjectType } from 'dynamoose/dist/General';
import { HttpDynamoDBResponsePagination } from '../interfaces/app';
import DB_HELPERS from './helpers';
import Feeds, { IFeed } from './models/feeds';

const getUserFeeds = async (
    userId: string,
    limit: number,
    nextSearchStartFromKey?: ObjectType
): Promise<{ documents: Array<Partial<IFeed>> | undefined; dDBPagination: HttpDynamoDBResponsePagination }> => {
    const userFeedsQuery = await Feeds.query('userId').eq(userId).sort('descending');

    const paginatedDocuments = await DB_HELPERS.fetchDynamoDBPaginatedDocuments<IFeed>(
        userFeedsQuery,
        [],
        limit,
        ['userId', 'createdAt'],
        nextSearchStartFromKey
    );

    if (paginatedDocuments.dDBPagination.nextSearchStartFromKey) {
        paginatedDocuments.dDBPagination.nextSearchStartFromKey.createdAt = (
            paginatedDocuments.dDBPagination.nextSearchStartFromKey.createdAt as Date
        ).getTime();
    }

    return paginatedDocuments || [];
};

const createFeed = async (feed: IFeed): Promise<IFeed> => {
    const feedObj = new Feeds(feed);
    await feedObj.save();
    return feedObj;
};

const createMultipleFeeds = async (feeds: Array<IFeed>): Promise<boolean> => {
    const feedsRes = await Feeds.batchPut(feeds);
    const areAllFeedsCreated = feedsRes.unprocessedItems.length === 0;
    return areAllFeedsCreated;
};

const DB_QUERIES = {
    getUserFeeds,
    createFeed,
    createMultipleFeeds,
};

export default DB_QUERIES;
