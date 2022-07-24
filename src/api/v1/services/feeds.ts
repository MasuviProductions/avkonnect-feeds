import { IFeed } from '../../../db/models/feeds';
import DB_QUERIES from '../../../db/queries';

const getUserFeeds = async (userId: string): Promise<Array<IFeed>> => {
    const userFeeds = await DB_QUERIES.getUserFeeds(userId);
    return userFeeds || [];
};

const FEEDS_SERVICE = {
    getUserFeeds,
};

export default FEEDS_SERVICE;
