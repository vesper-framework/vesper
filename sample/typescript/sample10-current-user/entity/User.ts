import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Photo} from "./Photo";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @OneToMany(() => Photo, photo => photo.author)
    photos: Photo[];

}