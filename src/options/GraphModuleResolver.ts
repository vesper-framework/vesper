import {GraphModuleResolverMethod} from "./GraphModuleResolverMethod";
import {EntitySchema} from "typeorm";

/**
 * Used to register a module resolver.
 */
export interface GraphModuleResolver {

    /**
     * What model's data will resolve this resolver.
     */
    model: string|EntitySchema<any>|Function;

    /**
     * Resolver class.
     */
    resolver: Function;

    /**
     * Resolver methods.
     */
    methods: (string|GraphModuleResolverMethod)[];

}