// /chart-project/src/streaming.js

const { CRYPTO_COMPARE } = require('../app/keys.js');

const socket = new WebSocket(
    'wss://streamer.cryptocompare.com/v2?api_key=' + CRYPTO_COMPARE
  );
  
  const channelToSubscription = new Map();
  const pendingMessages = []; // Queue to hold messages until the socket is open
  
  socket.addEventListener('open', () => {
    console.log('[socket] Connected');
    // Send any messages that were queued while connecting
    while (pendingMessages.length > 0) {
      socket.send(pendingMessages.shift());
    }
  });
  
  socket.addEventListener('close', (reason) => {
    console.log('[socket] Disconnected:', reason);
  });
  
  socket.addEventListener('error', (error) => {
    console.log('[socket] Error:', error);
  });
  
  export function subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback, lastBar) {
    const channelString = `5~CCCAGG~${symbolInfo.name}~${symbolInfo.currency}`;
  
    // Avoid duplicate subscriptions
    if (channelToSubscription.has(channelString)) {
      return;
    }
  
    const subscription = {
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBar,
    };
  
    channelToSubscription.set(channelString, subscription);
  
    const message = JSON.stringify({
      action: 'SubAdd',
      subs: [channelString],
    });
  
    // If the socket is open, send the message; otherwise, queue it
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      pendingMessages.push(message);
    }
  }
  
  export function unsubscribeFromStream(symbolInfo) {
    const channelString = `5~CCCAGG~${symbolInfo.name}~${symbolInfo.currency}`;
  
    const message = JSON.stringify({
      action: 'SubRemove',
      subs: [channelString],
    });
  
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      console.warn('[socket] Cannot unsubscribe; socket not open');
    }
  
    channelToSubscription.delete(channelString);
  }
  