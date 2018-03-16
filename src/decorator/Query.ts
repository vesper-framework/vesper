import {getMetadataArgsStorage} from "../index";

/**
 * Registers a controller method as a GraphQL query.
 */
export function Query(options?: { name?: string, transaction?: boolean }) {
    return function (object: Object, methodName: string) {
        getMetadataArgsStorage().actions.push({
            type: "query",
            target: object.constructor,
            methodName: methodName,
            name: (options && options.name) ? options.name : undefined,
            transaction: (options && options.transaction === true) ? true : false
        });
    };
}