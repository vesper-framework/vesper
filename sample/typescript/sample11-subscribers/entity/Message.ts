import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Message {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text: string;

    @Column()
    receiver: number;

}