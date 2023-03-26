import { FastifyInstance, FastifyPluginOptions, FastifyRegisterOptions } from 'fastify';
import { authHandler } from '../../../middlewares/authHandler';
import {
    feedGenerateSampleEvent,
    getFeedsForUser,
    getTrendingPosts,
    managedFeedsForUser,
} from '../controllers/feedsController';

const initializeCommentsRoutes = (
    fastify: FastifyInstance,
    _opts?: FastifyRegisterOptions<FastifyPluginOptions>,
    done?: () => void
) => {
    fastify.get('/users/:userId/feeds', { preHandler: [authHandler] }, getFeedsForUser);

    fastify.post('/feedGenerateSampleEvent', feedGenerateSampleEvent);

    fastify.post('/trending', getTrendingPosts);
    fastify.post('/users/:userId/managed', managedFeedsForUser);

    done?.();
};

export default initializeCommentsRoutes;
