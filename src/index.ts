import { fastify } from 'fastify';
import initializeV1Routes from './api/v1/routes';
import { initDynamoDB } from './db/client';

const APP = fastify({
    logger: true,
});

initDynamoDB();

initializeV1Routes(APP);

export { APP };
export default APP;
