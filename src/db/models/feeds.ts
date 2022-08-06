import * as dynamoose from 'dynamoose';
import { TABLE } from '../../constants/db';
import { IDynamooseDocument } from '../../interfaces/app';
import { ISourceType } from './shared';

interface IFeedSource {
    sourceId: string;
    sourceType: ISourceType;
    resourceType: 'post' | 'comment' | 'reaction';
    resourceId: string;
}
const FeedSourceSchema = new dynamoose.Schema({
    sourceId: { type: String },
    sourceType: { type: String },
    resourceType: { type: String },
    resourceId: { type: String },
});

interface IFeed {
    id: string; // lsi
    sourceId: string; // partition key
    sourceType: ISourceType;
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
    sourceId: { type: String, hashKey: true },
    sourceType: { type: String },
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
