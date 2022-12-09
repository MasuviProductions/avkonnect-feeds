import * as dynamoose from 'dynamoose';
import { TABLE } from '../../constants/db';
import { IDynamooseDocument } from '../../interfaces/app';

interface ITrending {
    score: number;
    postId: string;
}
const TrendingSchema = new dynamoose.Schema({
    score: { type: Number },
    postId: { type: String, hashKey: true },
});

const Trending = dynamoose.model<IDynamooseDocument<ITrending>>(TABLE.TRENDING, TrendingSchema);

export default Trending;
export type { ITrending };
