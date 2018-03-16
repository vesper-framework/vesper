import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Post} from "./Post";

@Entity()
export class Category {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Post, post => post.categories)
    posts: Post[];

}