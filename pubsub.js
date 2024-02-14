const redis = require('redis');

const CHANNELS = {
    "TEST": "TEST",
}

class Pubsub {
    constructor() {
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscriber.subscribe(CHANNELS.TEST);
        this.subscriber.on('message', (channel, message) => {
            this.handleMessage(channel, message);
        });
    }
        handleMessage(channel, message) {
            console.log(`Message received on channel ${channel}: ${message}`);
        }; 
}

const newPubsup = new Pubsub();

setTimeout(() => {
    newPubsup.publisher.publish(CHANNELS.TEST, "Hello World");
}, 1000);