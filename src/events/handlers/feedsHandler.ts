import { IFeedsEventRecord } from '../../interfaces/app';
import { feedsEventProcessor } from '../services/feeds';

interface ISQSEventRecord {
    body: string;
}

interface ISQSEvent {
    Records: ISQSEventRecord[];
}
const notificationsActivityHandler = async (event: ISQSEvent) => {
    for (const message of event.Records) {
        try {
            const feedsEventRecord = JSON.parse(message.body) as IFeedsEventRecord;
            await feedsEventProcessor(feedsEventRecord);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log('ERROR:', (err as Error).message, err);
        }
    }
};

export default notificationsActivityHandler;
