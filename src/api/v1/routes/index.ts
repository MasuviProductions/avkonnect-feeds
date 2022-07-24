import { FastifyInstance } from 'fastify';
import initializeFeedsRoutes from './feedsRoutes';

const initializeV1Routes = (fastifyInstance: FastifyInstance) => {
    const v1ServicePrefix = '/api/feeds/v1';
    fastifyInstance.register(initializeFeedsRoutes, { prefix: v1ServicePrefix });
};

export default initializeV1Routes;
