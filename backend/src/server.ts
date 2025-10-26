import app from "./app"

const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Hello World!",
    date: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`) // response aja bikinnya (bikin healthcheck aja)
})
