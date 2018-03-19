# Subscribers

> This guide is for TypeScript users. JavaScript version is [here](../javascript/subscribers.md).

To work with subscribers you need to create a `PubSub` instance and use it across app.
Best way to use a single instance across the app is to register it in service container:

```typescript
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

```typescript
@Controller()
export class MessageController {

    @Subscription()
    messageSent({ messageSent }, args: MessageSentArgs) {
        return messageSent.receiver === args.me;
    }

}
```

Now, when you send a message simply use pubSub instance from service container:

```typescript
export class MessageController {

    constructor(private entityManager: EntityManager,
                private pubSub: PubSub) {
    }

    @Subscription()
    messageSent({ messageSent }, args: MessageSentArgs) {
        return messageSent.receiver === args.me;
    }

    @Mutation()
    async messageSave(args: MessageSaveArgs) {
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