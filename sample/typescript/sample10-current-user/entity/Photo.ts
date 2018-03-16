import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";

@Entity()
export class Photo {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    filename: string;

    @Column()
    authorId: number;

    @ManyToOne(() => User, user => user.photos)
    author: User;

    /**
     * Indicates, if photo was added by currently authorized user.
     */
    addedByCurrentUser: boolean;

}