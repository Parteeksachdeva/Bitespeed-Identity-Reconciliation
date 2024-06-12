import app from "./app.ts";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});
