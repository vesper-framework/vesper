import {bootstrap} from "../../../src";
import {MessageController} from "./controller/MessageController";
import {Message} from "./entity/Message";
import {PubSub} from "graphql-subscriptions";

const pubSub = new PubSub();

bootstrap({
    port: 3000,
    controllers: [MessageController],
    entities: [Message],
    schemas: [__dirname + "/schema/**/*.graphql"],
    setupContainer: container => container.set(PubSub, pubSub),
    subscriptionAsyncIterator: triggers => pubSub.asyncIterator(triggers)
});