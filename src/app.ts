import express from "express";
import { json } from "body-parser";
import { ContactRoute } from "./routes/ContactRoute";

const app = express();
app.use(json());

app.use(`/contact`, ContactRoute);

app.get("/ping", (req, res) => {
  res.json({ ping: "pong" });
});

export default app;
