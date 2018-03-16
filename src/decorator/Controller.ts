import {getMetadataArgsStorage} from "../index";

/**
 * Registers a class as a graph controller.
 */
export function Controller() {
    return function (target: Function) {
        getMetadataArgsStorage().controllers.push({ target: target });
    };
}