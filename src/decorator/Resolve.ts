import {getMetadataArgsStorage} from "../index";

/**
 * Used in resolvers to mark method as resolving some data.
 */
export function Resolve(options?: { name?: string }) {
    return function (object: Object, propertyName: string) {
        const paramTypes = Reflect.getMetadata("design:paramtypes", object, propertyName);
        const isMany = paramTypes && paramTypes[0] === Array;
        getMetadataArgsStorage().resolves.push({
            target: object.constructor,
            methodName: propertyName,
            name: (options && options.name) ? options.name : undefined,
            dataLoader: isMany
        });
    };
}