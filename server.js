const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
	session({
		secret: "Thisismylittlesecret.",
		resave: false,
		saveUninitialized: false,
	})
);

mongoose.connect(
	"mongodb+srv://Yixuan:abAB12!@@cluster0.boczf.mongodb.net/test?retryWrites=true&w=majority",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	}
);

const User = require("./models/User");

const PORT = process.env.port || 3000;

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/register", (req, res) => {
	res.render("register");
});

app.post("/register", (req, res) => {
	const data = req.body;
	const newUser = new User({
		email: data.email,
		name: data.name,
		password: bcrypt.hashSync(
			data.password,
			bcrypt.genSaltSync(saltRounds),
			null
		),
		school: data.school,
		phone: data.pn,
		classes: {
			math: data.math,
			english: data.english,
			science: data.science,
			socialStudies: data.socialStudies,
		},
	});

	newUser.save();
	res.redirect("/login");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.post("/login", function (req, res) {
	User.findOne({ email: req.body.email }, (err, foundUser) => {
		if (err) {
			console.log(err);
		} else {
			if (bcrypt.compareSync(req.body.password, foundUser.password)) {
				req.user = foundUser;
				res.redirect("/");
			} else {
				res.redirect("/login");
			}
		}
	});
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
