import {getMetadataArgsStorage} from "../index";

/**
 * Registers a controller method as a GraphQL mutation.
 */
export function Mutation(options?: { name?: string, transaction?: boolean }) {
    return function (object: Object, methodName: string) {
        getMetadataArgsStorage().actions.push({
            type: "mutation",
            target: object.constructor,
            methodName: methodName,
            name: (options && options.name) ? options.name : undefined,
            transaction: (options && options.transaction === false) ? false : true
        });
    };
}