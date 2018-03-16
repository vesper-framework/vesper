import {GraphModule} from "../../../../../src/options/GraphModule";
import {Photo} from "./entity/Photo";
import {PhotoController} from "./controller/PhotoController";

export class PhotoModule implements GraphModule {

    controllers = [
        PhotoController
    ];

    entities = [
        Photo
    ];

}