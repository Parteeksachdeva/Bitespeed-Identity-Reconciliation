import "reflect-metadata";
import { DataSource } from "typeorm";
import { Contact } from "./entity/Contact";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_URL,
  synchronize: true,
  logging: false,
  entities: [Contact],
  migrations: [],
  subscribers: [],
});
