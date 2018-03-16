import {Controller, Mutation, Query, Subscription} from "../../../../src";
import {Message} from "../entity/Message";
import {MessageSaveArgs} from "../args/MessageSaveArgs";
import {EntityManager} from "typeorm";
import {PubSub} from "graphql-subscriptions";
import {MessageSentArgs} from "../args/MessageSentArgs";

@Controller()
export class MessageController {

    constructor(private entityManager: EntityManager,
                private pubSub: PubSub) {
    }

    @Query()
    messages(): Promise<Message[]> {
        return this.entityManager.find(Message);
    }

    @Subscription()
    messageSent({ messageSent }: { messageSent: Message }, args: MessageSentArgs) {
        return messageSent.receiver === args.me;
    }

    @Mutation()
    async messageSave(args: MessageSaveArgs): Promise<Message> {
        const message = new Message();
        message.id = args.id;
        message.text = args.text;
        message.receiver = args.receiver;
        await this.entityManager.save(message);
        this.pubSub.publish("messageSent", { messageSent: message });
        return message;
    }

    @Mutation()
    async messageDelete({ id }: { id: number }): Promise<boolean> {
        const post = await this.entityManager.findOne(Message, id);
        await this.entityManager.remove(post);
        return true;
    }

}