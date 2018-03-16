/**
 * Metadata args for controller queries, mutations and subscriptions.
 */
export interface ActionMetadataArgs {

    /**
     * Action type.
     */
    type: "query"|"mutation"|"subscription";

    /**
     * Controller class on which action is applied.
     */
    target: Function;

    /**
     * Method on which action is applied.
     */
    methodName: string;

    /**
     * Mutation / query / subscription name.
     */
    name?: string;

    /**
     * Indicates if transaction is enabled for this action.
     * By default, its enabled for mutations and disabled for others.
     */
    transaction?: boolean;

}