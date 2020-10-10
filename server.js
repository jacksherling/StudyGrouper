const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
	new LocalStrategy(function (email, password, done) {
		User.findOne({ email: email }, function (err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, {
					message: "User with this email doesn't exist.",
				});
			}
			if (!user.validPassword(password)) {
				return done(null, false, { message: "Incorrect password." });
			}
			return done(null, user);
		});
	})
);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect(
	"mongodb+srv://Yixuan:abAB12!@@cluster0.boczf.mongodb.net/test?retryWrites=true&w=majority",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);

const PORT = process.env.port || 3000;

const User = require("./models/User");

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
		password: data.password,
		school: data.school,
		phone: data.pn,
		classes: {
			math: data.math,
			english: data.english,
			science: data.science,
			socialStudies: data.socialStudies,
		},
	});
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.post("/login", passport.authenticate("local"), function (req, res) {
	res.redirect("/");
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
