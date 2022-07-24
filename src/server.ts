import APP from '.';
import ENV from './constants/env';

APP.listen(ENV.PORT, (err) => {
    if (err) throw err;
});
