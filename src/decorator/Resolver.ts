import {getMetadataArgsStorage} from "../index";

/**
 * Register a resolver for a given model.
 */
export function Resolver(name: Function|string) {
    return function (target: Function) {
        getMetadataArgsStorage().resolvers.push({
            target: target,
            name: name
        });
    };
}