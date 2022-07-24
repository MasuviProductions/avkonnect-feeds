import * as dynamoose from 'dynamoose';
import { TABLE } from '../../constants/db';
import { IDynamooseDocument } from '../../interfaces/app';

interface IFeedSource {
    sourceId: string;
    resourceType: 'post' | 'comment' | 'reaction';
    resourceId: string;
}
const FeedSourceSchema = new dynamoose.Schema({
    sourceId: { type: String },
    rsourceType: { type: String },
    resourceId: { type: String },
});

interface IFeed {
    id: string; // lsi
    userId: string; // partition key
    createdAt: Date; // sort key
    postId: string; // lsi
    feedSources: Array<IFeedSource>;
}
const FeedsSchema = new dynamoose.Schema({
    id: {
        type: String,
        index: {
            name: 'feedIdIndex',
        },
    },
    userId: { type: String, hashKey: true },
    createdAt: { type: Date, rangeKey: true },
    postId: {
        type: String,
        index: {
            name: 'postIdIndex',
        },
    },
    feedSources: { type: Array, schema: Array.of(FeedSourceSchema) },
});

const Feeds = dynamoose.model<IDynamooseDocument<IFeed>>(TABLE.FEEDS, FeedsSchema);

export default Feeds;
export type { IFeed, IFeedSource };
