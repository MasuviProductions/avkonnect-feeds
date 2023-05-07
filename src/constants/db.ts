import ENV from './env';

export const TABLE = {
    FEEDS: `avk-${ENV.DEPLOYMENT_ENV}-feeds`,
    TRENDING: `avk-${ENV.DEPLOYMENT_ENV}-trending`,
};
