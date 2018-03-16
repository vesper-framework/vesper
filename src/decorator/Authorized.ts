import {getMetadataArgsStorage, RoleCheckerInterface} from "../index";

/**
 * Marks query / mutation to have a special access.
 * It usually means it requires user authorization or some specific user role.
 * Authorization logic must be defined in the framework settings.
 */
export function Authorized(roles?: { new (): RoleCheckerInterface }|any[]): Function {
    return function (object: Object, methodName?: string) {
        getMetadataArgsStorage().authorizes.push({
            target: object.constructor,
            methodName: methodName,
            roles: roles ? roles : []
        });
    };
}