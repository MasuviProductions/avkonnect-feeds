import { v4 } from 'uuid';
import ENV from '../../constants/env';
import { IFeed, IFeedSource } from '../../db/models/feeds';
import DB_QUERIES from '../../db/queries';
import { IConnectionApiModel } from '../../interfaces/api';
import { IFeedsEventRecord } from '../../interfaces/app';
import AVKKONNECT_CORE_SERVICE from '../../services/avkonnect-core';
import AVKONNECT_POSTS_SERVICE from '../../services/avkonnect-post';

const feedsEventProcessor = async (feedsRecord: IFeedsEventRecord) => {
    switch (feedsRecord.eventType) {
        case 'generateFeeds': {
            await generateUserFeed(feedsRecord);
        }
    }
};

const generateUserFeed = async (feedsRecord: IFeedsEventRecord) => {
    switch (feedsRecord.resourceType) {
        case 'post': {
            await generateFeedForPostCreation(feedsRecord.resourceId);
        }
    }
};

const generateFeedForPostCreation = async (postId: string) => {
    const postRes = await AVKONNECT_POSTS_SERVICE.getPost(ENV.AUTH_SERVICE_KEY, postId);
    const post = postRes.data;
    if (!post) {
        throw Error(`Post info not found for id{${postId}} `);
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
        const feedSource: IFeedSource = {
            sourceId: post.userId,
            resourceId: post.id,
            resourceType: 'post',
        };
        await createFeedForUsers(connections.data || [], post.id, feedSource);
        const fetchedNextSearchStartFromKey = connections.dDBPagination?.nextSearchStartFromKey;
        nextSearchStartFromKey = fetchedNextSearchStartFromKey
            ? encodeURI(JSON.stringify(fetchedNextSearchStartFromKey))
            : undefined;
    }
};

const createFeedForUsers = async (connections: Array<IConnectionApiModel>, postId: string, feedSource: IFeedSource) => {
    const feedsToCreate: Array<IFeed> = connections.map(
        (connection) =>
            ({
                id: v4(),
                userId: connection.connecteeId,
                createdAt: new Date(Date.now()),
                postId: postId,
                feedSources: [feedSource],
            } as IFeed)
    );

    const areFeedsCreated = await DB_QUERIES.createMultipleFeeds(feedsToCreate);
    if (!areFeedsCreated) {
        throw Error('Something went wrong while generating user feeds');
    }
};

export { feedsEventProcessor };
