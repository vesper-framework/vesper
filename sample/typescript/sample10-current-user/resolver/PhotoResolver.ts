import {Resolve, Resolver, ResolverInterface} from "../../../../src";
import {Photo} from "../entity/Photo";
import {CurrentUser} from "../model/CurrentUser";

@Resolver(Photo)
export class PhotoResolver implements ResolverInterface<Photo> {

    constructor(private currentUser?: CurrentUser) {
    }

    @Resolve()
    async addedByCurrentUser(photo: Photo) {
        if (!this.currentUser)
            return false;

        return photo.authorId === this.currentUser.id;
    }

}