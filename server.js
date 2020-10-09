const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const PORT = process.env.port || 3000;

app.get("/", (req, res) => {
	res.render("index");
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
