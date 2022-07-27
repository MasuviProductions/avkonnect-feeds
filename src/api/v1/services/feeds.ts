import { ObjectType } from 'dynamoose/dist/General';
import { IFeed } from '../../../db/models/feeds';
import DB_QUERIES from '../../../db/queries';
import { HttpDynamoDBResponsePagination } from '../../../interfaces/app';

const getUserFeeds = async (
    userId: string,
    limit: number,
    nextSearchStartFromKey?: ObjectType
): Promise<{
    documents: Partial<IFeed>[] | undefined;
    dDBPagination: HttpDynamoDBResponsePagination;
}> => {
    const userFeeds = await DB_QUERIES.getUserFeeds(userId, limit, nextSearchStartFromKey);
    return userFeeds;
};

const FEEDS_SERVICE = {
    getUserFeeds,
};

export default FEEDS_SERVICE;
