import app from "./app";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log("Server listening on", PORT);
    });
  })
  .catch((error) => console.log(error));
