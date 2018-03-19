# Subscribers

> This guide is for JavaScript users. TypeScript version is [here](../typescript/subscribers.md).

To work with subscribers you need to create a `PubSub` instance and use it across app.
Best way to use a single instance across the app is to register it in service container:

```javascript
import {bootstrap} from "graphstack";
import {PubSub} from "graphql-subscriptions";

const pubSub = new PubSub();

bootstrap({
    // ...
    setupContainer: container => container.set(PubSub, pubSub),
    subscriptionAsyncIterator: triggers => pubSub.asyncIterator(triggers)
});
```

As you can see we also need to provide a `subscriptionAsyncIterator` option in bootstrap options.

For the following subscription:

```graphql
type Subscription {
    messageSent(me: Int): Message
}
```

You create a following controller:

```javascript
export class MessageController {

    messageSent({ messageSent }, args) {
        return messageSent.receiver === args.me;
    }

}
```

And register subscription action this way:

```javascript
{ controller: MessageController, action: "messageSent", type: "subscription" }
```

Now, when you send a message simply use pubSub instance from service container:

```javascript
export class MessageController {

    constructor(container) {
        this.entityManager = container.get(EntityManager);
        this.pubSub = container.get(PubSub);
    }

    messageSent({ messageSent }, args) {
        return messageSent.receiver === args.me;
    }

    async messageSave(args) {
        const message = new Message();
        message.id = args.id;
        message.text = args.text;
        message.receiver = args.receiver;
        await this.entityManager.save(message);
        this.pubSub.publish("messageSent", { messageSent: message });
        return message;
    }

}
```