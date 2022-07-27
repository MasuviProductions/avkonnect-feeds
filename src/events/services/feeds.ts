import { v4 } from 'uuid';
import ENV from '../../constants/env';
import { IFeed, IFeedSource } from '../../db/models/feeds';
import DB_QUERIES from '../../db/queries';
import { IConnectionApiModel, IPostApiModel } from '../../interfaces/api';
import { IFeedsEventRecord } from '../../interfaces/app';
import AVKKONNECT_CORE_SERVICE from '../../services/avkonnect-core';
import AVKONNECT_POSTS_SERVICE from '../../services/avkonnect-post';

const feedsEventProcessor = async (feedsRecord: IFeedsEventRecord) => {
    switch (feedsRecord.eventType) {
        case 'generateFeeds': {
            await feedsGenerator(feedsRecord);
        }
    }
};

const feedsGenerator = async (feedsRecord: IFeedsEventRecord) => {
    switch (feedsRecord.resourceType) {
        case 'post': {
            const postRes = await AVKONNECT_POSTS_SERVICE.getPost(ENV.AUTH_SERVICE_KEY, feedsRecord.resourceId);
            const post = postRes.data;
            if (!post) {
                throw Error(`Post info not found for id{${feedsRecord.resourceId}} `);
            }

            let nextSearchStartFromKey: string | undefined;
            let isInitialIteration = true;

            while (isInitialIteration || nextSearchStartFromKey) {
                if (isInitialIteration) {
                    isInitialIteration = false;
                }
                const connections = await AVKKONNECT_CORE_SERVICE.getUserConnections(
                    ENV.AUTH_SERVICE_KEY,
                    post.userId,
                    'all',
                    50,
                    nextSearchStartFromKey
                );
                await generateFeedForUsers(post, connections.data || []);
                const fetchedNextSearchStartFromKey = connections.dDBPagination?.nextSearchStartFromKey;
                nextSearchStartFromKey = fetchedNextSearchStartFromKey
                    ? encodeURI(JSON.stringify(fetchedNextSearchStartFromKey))
                    : undefined;
            }
        }
    }
};

const generateFeedForUsers = async (post: IPostApiModel, connections: Array<IConnectionApiModel>) => {
    const feedsToCreate: Array<Promise<IFeed>> = [];
    connections.forEach((connection) => {
        const feed: IFeed = {
            id: v4(),
            userId: connection.connecteeId,
            createdAt: new Date(Date.now()),
            postId: post.id,
            feedSources: [
                {
                    sourceId: post.userId,
                    resourceType: 'post',
                    resourceId: post.id,
                },
            ] as Array<IFeedSource>,
        };
        feedsToCreate.push(DB_QUERIES.createFeed(feed));
    });

    await Promise.all(feedsToCreate).catch(() => {
        throw Error('Something went wrong while generating user feeds');
    });
};

export { feedsEventProcessor };
