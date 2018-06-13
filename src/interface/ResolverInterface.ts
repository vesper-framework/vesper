import {GraphQLResolveInfo} from "graphql";

/**
 * Resolvers can implement this type to provide a proper method signatures for some model T.
 */
export type ResolverInterface<T> = {
    [P in keyof T]?: (entities: T|T[], args?: object, context?: any, info?: GraphQLResolveInfo) => Promise<(T[P][])|T[P]>|((T[P][])|T[P]);
};
