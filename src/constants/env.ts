import dotenv from 'dotenv';

dotenv.config();

const ENV = {
    DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV === 'prod' ? 'prod' : 'dev',
    PORT: process.env.PORT || 3000,
    AWS: {
        KEY: process.env.AWS_KEY,
        SECRET: process.env.AWS_SECRET,
        REGION: process.env.AWS_REGION,
    },
    AUTH_SERVICE_KEY: process.env.AUTH_SERVICE_KEY as string,
    AVKONNECT_CORE_URL: process.env.AVKONNECT_CORE_URL,
    AVKONNECT_POSTS_URL: process.env.AVKONNECT_POSTS_URL,
};

export default ENV;
