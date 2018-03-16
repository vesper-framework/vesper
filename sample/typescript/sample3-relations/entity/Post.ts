import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Category} from "./Category";

@Entity()
export class Post {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    text: string;

    @ManyToMany(() => Category, category => category.posts)
    @JoinTable()
    categories: Category[];

}