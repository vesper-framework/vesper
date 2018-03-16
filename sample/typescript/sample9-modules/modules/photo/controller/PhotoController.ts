import {Controller, Mutation, Query} from "../../../../../../src";
import {EntityManager} from "typeorm";
import {Photo} from "../entity/Photo";
import {PhotoSaveArgs} from "../args/PhotoSaveArgs";

@Controller()
export class PhotoController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    photos(): Promise<Photo[]> {
        return this.entityManager.find(Photo);
    }

    @Query()
    photo({ id }: { id: number }): Promise<Photo> {
        return this.entityManager.findOne(Photo, id);
    }

    @Mutation()
    async photoSave(args: PhotoSaveArgs): Promise<Photo> {
        const photo = args.id ? await this.entityManager.findOneOrFail(Photo, args.id) : new Photo();
        photo.title = args.title;
        photo.filename = args.filename;
        return this.entityManager.save(photo);
    }

    @Mutation()
    async photoDelete({ id }: { id: number }): Promise<boolean> {
        const photo = await this.entityManager.findOne(Photo, id);
        await this.entityManager.remove(photo);
        return true;
    }

}