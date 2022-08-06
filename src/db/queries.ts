import { ObjectType } from 'dynamoose/dist/General';
import { HttpDynamoDBResponsePagination } from '../interfaces/app';
import DB_HELPERS from './helpers';
import Feeds, { IFeed } from './models/feeds';

const getSourceFeeds = async (
    sourceId: string,
    limit: number,
    nextSearchStartFromKey?: ObjectType
): Promise<{ documents: Array<Partial<IFeed>> | undefined; dDBPagination: HttpDynamoDBResponsePagination }> => {
    const sourceFeedsQuery = await Feeds.query('sourceId').eq(sourceId).sort('descending');

    const paginatedDocuments = await DB_HELPERS.fetchDynamoDBPaginatedDocuments<IFeed>(
        sourceFeedsQuery,
        [],
        limit,
        ['sourceId', 'createdAt'],
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

const createFeeds = async (feeds: Array<IFeed>): Promise<boolean> => {
    if (feeds.length <= 0) {
        return true;
    }
    const feedsRes = await Feeds.batchPut(feeds);
    const areFeedsCreated = feedsRes.unprocessedItems.length === 0;
    return areFeedsCreated;
};

const getFeedsForSourceIdsByPostId = async (sourceIds: Set<string>, postId: string): Promise<Array<IFeed>> => {
    const sourceFeedsList = Array.from(sourceIds);
    if (sourceFeedsList.length <= 0) {
        return [];
    }
    const feeds = await Feeds.scan('postId')
        .eq(postId)
        .and()
        .where('sourceId')
        .in(sourceFeedsList)
        .using('postIdIndex')
        .exec();
    return feeds;
};

const DB_QUERIES = {
    getSourceFeeds,
    createFeed,
    createFeeds,
    getFeedsForSourceIdsByPostId,
};

export default DB_QUERIES;
