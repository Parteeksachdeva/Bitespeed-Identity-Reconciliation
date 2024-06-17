import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint", nullable: true })
  phoneNumber: number | null;

  @Column({ type: "varchar", length: 30, nullable: true })
  email: string | null;

  @Column({ type: "int", nullable: true })
  linkedId: number | null;

  @Column({
    type: "enum",
    enum: ["secondary", "primary"],
  })
  linkPrecedence: "secondary" | "primary";

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
