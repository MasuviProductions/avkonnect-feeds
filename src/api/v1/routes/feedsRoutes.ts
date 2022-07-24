import { FastifyInstance, FastifyPluginOptions, FastifyRegisterOptions } from 'fastify';
import { authHandler } from '../../../middlewares/authHandler';
import { feedGenerateSampleEvent, getFeedsForUser } from '../controllers/feedsController';

const initializeCommentsRoutes = (
    fastify: FastifyInstance,
    _opts?: FastifyRegisterOptions<FastifyPluginOptions>,
    done?: () => void
) => {
    fastify.get('/users/:userId/feeds', { preHandler: [authHandler] }, getFeedsForUser);

    fastify.post('/feedGenerateSampleEvent', feedGenerateSampleEvent);

    done?.();
};

export default initializeCommentsRoutes;
