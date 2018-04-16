import "reflect-metadata";
import {EntityManager, getMetadataArgsStorage as getTypeormMetadataArgsStorage} from "typeorm";
import {Action} from "./interface/Action";
import {SchemaBuilder} from "./SchemaBuilder";
import {ActionMetadata} from "./metadata/ActionMetadata";
import {Container} from "typedi";

/**
 * Executes action in multiple steps.
 * While we could do it in a single step using async/await syntax we decided to
 * make core complex code in favour of less ticks to improve performance.
 */
export class ActionExecutor {

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(protected builder: SchemaBuilder) {
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Executes controller action.
     */
    executeControllerAction(action: Action): any {
        return this.step1(action);
    }

    /**
     * Executes resolver action.
     */
    executeResolver(action: Action): any {
        return this.step3(action);
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    /**
     * First step - check if action must run in a transaction.
     */
    protected step1(action: Action): any {

        // create a new scoped container for this request
        if (this.builder.connection) {
            if ((action.metadata as ActionMetadata).transaction && this.builder.connection.options.type !== "mongodb") {
                return this.builder.connection.manager.transaction(entityManager => {
                    return this.step2(action, entityManager);
                });
            } else {
                return this.step2(action, this.builder.connection.manager);
            }
        }

        return this.step2(action);
    }

    /**
     * Second step - setup container.
     */
    protected step2(action: Action, entityManager?: EntityManager): any {

        // in the case if someone inject container itself
        action.context.container.set(Container, action.context.container);

        // if entity manager was given the register it in the container
        if (entityManager) {
            action.context.container.set(EntityManager, entityManager);
            getTypeormMetadataArgsStorage().entityRepositories.forEach(repository => {
                action.context.container.set(repository.target, entityManager.getCustomRepository(repository.target));
            });
        }

        // if setup-container callback was set then execute it before controller method execution
        if (this.builder.options.setupContainer) {
            const setupContainerResult = this.builder.options.setupContainer(action.container, action);
            if (setupContainerResult instanceof Promise)
                return setupContainerResult.then(() => this.step3(action));
        }

        return this.step3(action);
    }

    /**
     * Third step - check authorization.
     */
    protected step3(action: Action): any {

        let promiseResults: Promise<any>[] = [];
        action.metadata.authorizes.forEach(authorize => {

            let authorizationCheckResult: any;
            if (authorize instanceof Array) {
                authorizationCheckResult = this.builder.options.authorizationChecker(authorize, action);
            } else {
                authorizationCheckResult = action.container.get(authorize).check(action);
            }
            if (authorizationCheckResult instanceof Promise)
                promiseResults.push(authorizationCheckResult);
        });
        if (promiseResults.length > 0)
            return Promise.all(promiseResults).then(result => this.step4(action));

        return this.step4(action);
    }

    /**
     * Forth step - validate action args.
     */
    protected step4(action: Action): any {

        let promiseResults: Promise<any>[] = [];
        action.metadata.validators.forEach(validator => {
            const validationResult = action.container.get(validator).validate(action.args);
            if (validationResult instanceof Promise)
                promiseResults.push(validationResult);
        });
        if (promiseResults.length > 0)
            return Promise.all(promiseResults).then(result => this.step5(action));

        return this.step5(action);
    }

    /**
     * Fifth step - execute controller / resolver method.
     */
    protected step5(action: Action): any {
        let result: any;
        if ((action.metadata as ActionMetadata).type === "query" || (action.metadata as ActionMetadata).type === "mutation") {
            result = action.container.get<any>(action.metadata.target)[action.metadata.methodName](action.args, action.context, action.info);
        } else {
            // for subscriptions and resolver methods we send obj
            result = action.container.get<any>(action.metadata.target)[action.metadata.methodName](action.obj, action.args, action.context, action.info);
        }
        if (result instanceof Promise)
            return result.then(result => this.step6(action, result));

        return this.step6(action, result);
    }

    /**
     * Final step - we need to setup original entity manager back since if its a mutation in a transaction,
     * transaction is already released at fifth step, but resolvers may need an entity manager to return some data back,
     * and here we setup global entity manager back to the container, to prevent issue with released entity manager.
     */
    protected step6(action: Action, result: any) {

        const containerEntityManager = action.container.get(EntityManager);
        if (containerEntityManager !== this.builder.connection.manager) {
            action.context.container.set(EntityManager, this.builder.connection.manager);
            getTypeormMetadataArgsStorage().entityRepositories.forEach(repository => {
                action.context.container.set(repository.target, this.builder.connection.manager.getCustomRepository(repository.target));
            });
        }

        return result;
    }

}
