import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Photo {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    filename: string;

}