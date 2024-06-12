import express from "express";
import { json } from "body-parser";

const app = express();
app.use(json());

app.get("/ping", (req, res) => {
  res.json({ ping: "pong" });
});

export default app;