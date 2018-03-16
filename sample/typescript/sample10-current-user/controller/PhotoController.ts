import {Authorized, Controller, Mutation, Query} from "../../../../src";
import {EntityManager} from "typeorm";
import {Photo} from "../entity/Photo";
import {PhotoSaveArgs} from "../args/PhotoSaveArgs";
import {CurrentUser} from "../model/CurrentUser";

@Controller()
export class PhotoController {

    constructor(private entityManager: EntityManager,
                private currentUser?: CurrentUser) {
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
    @Authorized()
    async photoSave(args: PhotoSaveArgs): Promise<Photo> {

        const photo = args.id ? await this.entityManager.findOneOrFail(Photo, args.id) : new Photo();
        photo.title = args.title;
        photo.filename = args.filename;
        photo.authorId = this.currentUser.id;

        return this.entityManager.save(photo);
    }

    @Mutation()
    @Authorized()
    async photoDelete({ id }: { id: number }): Promise<boolean> {
        const photo = await this.entityManager.findOne(Photo, id);
        if (this.currentUser.id !== photo.id)
            throw new Error(`You don't have access to remove this photo.`);

        await this.entityManager.remove(photo);
        return true;
    }

}