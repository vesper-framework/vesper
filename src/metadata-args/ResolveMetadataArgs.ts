/**
 * Metadata args for Resolve.
 */
export interface ResolveMetadataArgs {

    /**
     * Class on which resolve is applied.
     */
    target: Function;
    
    /**
     * Method on which resolve is applied.
     */
    methodName: string;

    /**
     * Resolve name.
     */
    name?: string;

    /**
     * Indicates if data loader is enabled for this resolve method or not.
     * By default its enabled.
     */
    dataLoader?: boolean;

}