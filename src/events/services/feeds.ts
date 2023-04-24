import { v4 } from 'uuid';
import ENV from '../../constants/env';
import { IFeed, IFeedSource } from '../../db/models/feeds';
import Trending from '../../db/models/trending';
import DB_QUERIES from '../../db/queries';
import { IActivityApiModel, IConnectionApiModel } from '../../interfaces/api';
import { IFeedsEventRecord } from '../../interfaces/app';
import AVKKONNECT_CORE_SERVICE from '../../services/avkonnect-core';
import AVKONNECT_POSTS_SERVICE from '../../services/avkonnect-post';
import { transformFeedsListToSourceIdFeedsMap } from '../../utils/transformers';

const feedsEventProcessor = async (feedsRecord: IFeedsEventRecord) => {
    switch (feedsRecord.eventType) {
        case 'generateFeeds': {
            await generateUserFeed(feedsRecord);
            return;
        }
        case 'computeTrendingPostScore': {
            await computeTrendingPostScore(feedsRecord);
            return;
        }
    }
};

const computeTrendingPostScore = async (feedsRecord: IFeedsEventRecord) => {
    const postActivity = await AVKONNECT_POSTS_SERVICE.getPostActivity(ENV.AUTH_SERVICE_KEY, feedsRecord.resourceId);
    const {
        resourceId,
        reactionsCount: { love, like, support, laugh, sad },
        commentsCount: { comment, subComment },
    } = postActivity.data as IActivityApiModel;

    const score = 0.5 * (laugh + like + love + sad + support) + 0.4 * comment + 0.2 * subComment - 0.2;

    const trendingPostId = await Trending.query('postId').eq(resourceId).exists();

    if (!trendingPostId) {
        const trending = { postId: resourceId, score: score };
        const trendingObj = new Trending(trending);
        await trendingObj.save();
        return trendingObj;
    } else {
        return await Trending.update({ postId: resourceId }, { score: score });
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
    //1. gets the Post data
    const postRes = await AVKONNECT_POSTS_SERVICE.getPost(ENV.AUTH_SERVICE_KEY, postId);
    const post = postRes.data;
    if (!post) {
        throw Error(`Post info not found for id{${postId}} `);
    }
    //create a feed Creation Callback
    const feedCreationCallback = async (connections: Array<IConnectionApiModel>): Promise<IFeed[]> => {
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
        return feedsToCreate;
    };
    await generateFeedForConnections(post.sourceId, feedCreationCallback);
};

const generateFeedForPostReaction = async (reactionId: string) => {
    const reaction = await AVKONNECT_POSTS_SERVICE.getReaction(ENV.AUTH_SERVICE_KEY, reactionId);
    const reactionSourceId = reaction.data?.sourceId as string;
    const postId = reaction.data?.resourceId as string;
    const postRes = await AVKONNECT_POSTS_SERVICE.getPost(ENV.AUTH_SERVICE_KEY, postId);

    const post = postRes.data;
    if (!post) {
        throw Error(`Post info not found for id{${postId}} `);
    }
    const feedCreationCallback = async (connections: Array<IConnectionApiModel>): Promise<IFeed[]> => {
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
        return feedsToCreate;
    };
    await generateFeedForConnections(reactionSourceId, feedCreationCallback);
};

const generateFeedForPostComment = async (commentId: string) => {
    const comment = await AVKONNECT_POSTS_SERVICE.getComment(ENV.AUTH_SERVICE_KEY, commentId);
    const commentSourceId = comment.data?.sourceId as string;
    const postId = comment.data?.resourceId as string;
    const postRes = await AVKONNECT_POSTS_SERVICE.getPost(ENV.AUTH_SERVICE_KEY, postId);
    const post = postRes.data;
    if (!post) {
        throw Error(`Post info not found for id{${postId}} `);
    }
    const feedCreationCallback = async (connections: Array<IConnectionApiModel>): Promise<IFeed[]> => {
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
        return feedsToCreate;
    };
    await generateFeedForConnections(commentSourceId, feedCreationCallback);
};

const generateFeedForConnections = async (
    userId: string,
    feedCreationCallback: (connections: Array<IConnectionApiModel>) => Promise<IFeed[]>
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

        const feedsToCreate = await feedCreationCallback(connections.data || []);
        await createFeedForUsers(feedsToCreate);

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
