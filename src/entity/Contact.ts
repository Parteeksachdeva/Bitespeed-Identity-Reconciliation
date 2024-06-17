import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: "bigint", nullable: true })
  phoneNumber: number | null;

  @Index()
  @Column({ type: "varchar", length: 30, nullable: true })
  email: string | null;

  @Index()
  @Column({ type: "bigint", nullable: true })
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
