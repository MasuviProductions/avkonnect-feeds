import { v4 } from 'uuid';
import ENV from '../../constants/env';
import { IFeed, IFeedSource } from '../../db/models/feeds';
import DB_QUERIES from '../../db/queries';
import { IConnectionApiModel } from '../../interfaces/api';
import { IFeedsEventRecord } from '../../interfaces/app';
import AVKKONNECT_CORE_SERVICE from '../../services/avkonnect-core';
import AVKONNECT_POSTS_SERVICE from '../../services/avkonnect-post';
import { transformFeedsListToSourceIdFeedsMap } from '../../utils/transformers';

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
            return;
        }
        case 'reaction': {
            await generateFeedForPostReaction(feedsRecord.resourceId);
            return;
        }
        case 'comment': {
            await generateFeedForPostComment(feedsRecord.resourceId);
        }
    }
};

const generateFeedForPostCreation = async (postId: string) => {
    const postRes = await AVKONNECT_POSTS_SERVICE.getPost(ENV.AUTH_SERVICE_KEY, postId);
    const post = postRes.data;
    if (!post) {
        throw Error(`Post info not found for id{${postId}} `);
    }
    const feedCreationCallback = async (connections: Array<IConnectionApiModel>) => {
        const feedSource: IFeedSource = {
            sourceId: post.sourceId,
            sourceType: post.sourceType,
            resourceId: post.id,
            resourceType: 'post',
        };
        const feedsToCreate: Array<IFeed> = connections.map(
            (connection) =>
                ({
                    id: v4(),
                    sourceId: connection.connecteeId,
                    sourceType: 'user',
                    createdAt: new Date(Date.now()),
                    postId: postId,
                    feedSources: [feedSource],
                } as IFeed)
        );
        await createFeedForUsers(feedsToCreate);
    };
    await generateFeedForConnections(post.sourceId, feedCreationCallback);
};

const generateFeedForPostReaction = async (reactionId: string) => {
    const reaction = await AVKONNECT_POSTS_SERVICE.getReaction(ENV.AUTH_SERVICE_KEY, reactionId);
    const postId = reaction.data?.resourceId as string;
    const postRes = await AVKONNECT_POSTS_SERVICE.getPost(ENV.AUTH_SERVICE_KEY, postId);

    const post = postRes.data;
    if (!post) {
        throw Error(`Post info not found for id{${postId}} `);
    }
    const feedCreationCallback = async (connections: Array<IConnectionApiModel>) => {
        const connectionIds = new Set(
            connections
                .map((connection) => connection.connecteeId)
                .filter((connectionId) => connectionId != post.sourceId)
        );
        const usersFeedsForPost = await DB_QUERIES.getFeedsForSourceIdsByPostId(connectionIds, postId);
        const userIdFeedsMap = transformFeedsListToSourceIdFeedsMap(usersFeedsForPost);

        const feedsToCreate: Array<IFeed> = connections.map((connection) => {
            const feedSource: IFeedSource = {
                sourceId: connection.connectorId,
                sourceType: 'user',
                resourceId: reactionId,
                resourceType: 'reaction',
            };
            const existingUserFeed = userIdFeedsMap[connection.connecteeId];
            if (existingUserFeed) {
                const feedtoUpdate: IFeed = {
                    ...existingUserFeed,
                    // TODO: Trim too many feed sources
                    feedSources: [...existingUserFeed.feedSources, feedSource],
                };
                return feedtoUpdate;
            } else {
                const feedToCreate: IFeed = {
                    id: v4(),
                    sourceId: connection.connecteeId,
                    sourceType: 'user',
                    createdAt: new Date(Date.now()),
                    postId: postId,
                    feedSources: [feedSource],
                };
                return feedToCreate;
            }
        });
        await createFeedForUsers(feedsToCreate);
    };
    await generateFeedForConnections(post.sourceId, feedCreationCallback);
};

const generateFeedForPostComment = async (commentId: string) => {
    const comment = await AVKONNECT_POSTS_SERVICE.getComment(ENV.AUTH_SERVICE_KEY, commentId);
    const postId = comment.data?.resourceId as string;
    const postRes = await AVKONNECT_POSTS_SERVICE.getPost(ENV.AUTH_SERVICE_KEY, postId);
    const post = postRes.data;
    if (!post) {
        throw Error(`Post info not found for id{${postId}} `);
    }
    const feedCreationCallback = async (connections: Array<IConnectionApiModel>) => {
        const connectionIds = new Set(
            connections
                .map((connection) => connection.connecteeId)
                .filter((connectionId) => connectionId != post.sourceId)
        );
        const usersFeedsForPost = await DB_QUERIES.getFeedsForSourceIdsByPostId(connectionIds, postId);
        const userIdFeedsMap = transformFeedsListToSourceIdFeedsMap(usersFeedsForPost);

        const feedsToCreate: Array<IFeed> = connections.map((connection) => {
            const feedSource: IFeedSource = {
                sourceId: connection.connectorId,
                sourceType: 'user',
                resourceId: commentId,
                resourceType: 'comment',
            };
            const existingUserFeed = userIdFeedsMap[connection.connecteeId];
            if (existingUserFeed) {
                const feedtoUpdate: IFeed = {
                    ...existingUserFeed,
                    // TODO: Trim too many feed sources
                    feedSources: [...existingUserFeed.feedSources, feedSource],
                };
                return feedtoUpdate;
            } else {
                const feedToCreate: IFeed = {
                    id: v4(),
                    sourceId: connection.connecteeId,
                    sourceType: 'user',
                    createdAt: new Date(Date.now()),
                    postId: postId,
                    feedSources: [feedSource],
                };
                return feedToCreate;
            }
        });
        await createFeedForUsers(feedsToCreate);
    };
    await generateFeedForConnections(post.sourceId, feedCreationCallback);
};

const generateFeedForConnections = async (
    userId: string,
    feedCreationCallback: (connections: Array<IConnectionApiModel>) => Promise<void>
) => {
    let nextSearchStartFromKey: string | undefined;
    let isInitialIteration = true;

    while (isInitialIteration || nextSearchStartFromKey) {
        if (isInitialIteration) {
            isInitialIteration = false;
        }
        const connections = await AVKKONNECT_CORE_SERVICE.getUserConnections(
            ENV.AUTH_SERVICE_KEY,
            userId,
            'all',
            50,
            nextSearchStartFromKey
        );

        await feedCreationCallback(connections.data || []);
        const fetchedNextSearchStartFromKey = connections.dDBPagination?.nextSearchStartFromKey;
        nextSearchStartFromKey = fetchedNextSearchStartFromKey
            ? encodeURI(JSON.stringify(fetchedNextSearchStartFromKey))
            : undefined;
    }
};

const createFeedForUsers = async (feedsToCreate: Array<IFeed>) => {
    const areFeedsCreated = await DB_QUERIES.createFeeds(feedsToCreate);
    if (!areFeedsCreated) {
        throw Error('Something went wrong while generating user feeds');
    }
};

export { feedsEventProcessor };
