import Feeds, { IFeed } from './models/feeds';

const getUserFeeds = async (userId: string): Promise<Array<IFeed> | undefined> => {
    const userFeeds = await Feeds.query('id').eq(userId).exec();
    return userFeeds || [];
};

const createFeed = async (feed: IFeed): Promise<IFeed> => {
    const feedObj = new Feeds(feed);
    await feedObj.save();
    return feedObj;
};

const DB_QUERIES = { getUserFeeds, createFeed };

export default DB_QUERIES;
