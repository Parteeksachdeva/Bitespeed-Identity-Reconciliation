import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Contact } from "./entity/Contact";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: "postgres://root:STpmIeMhtKzH7B9DVcsbHkKdIQAeL7py@dpg-cpkrvqnsc6pc73f3iibg-a.oregon-postgres.render.com/bitespeed_97na?sslmode=require",
  synchronize: true,
  logging: false,
  entities: [User, Contact],
  migrations: [],
  subscribers: [],
});
