// /chart-project/src/datafeed.js

import { subscribeOnStream, unsubscribeFromStream } from './streaming.js';

const lastBarsCache = new Map();

export default {
    // Other methods...
    subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback
    ) => {
        console.log('[subscribeBars]: Called with subscriberUID:', subscriberUID);

        const lastBar = lastBarsCache.get(symbolInfo.full_name);

        subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscriberUID,
            lastBar
        );
    },

    unsubscribeBars: (subscriberUID) => {
        console.log('[unsubscribeBars]: Called with subscriberUID:', subscriberUID);

        unsubscribeFromStream(subscriberUID);
    },
};
