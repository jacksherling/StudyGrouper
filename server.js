const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(flash());
app.use(cookieParser("keyboard cat"));

const genuuid = (len) => {
	let id = "";
	let options =
		"QWERTYUIOPLKJHGFDSAZXCVBNMMqwertyuiopasdfghjklzxcvbnm123456789";
	for (let i = 0; i < len; i++) {
		id += options[Math.floor(Math.random() * options.length)];
	}
	return id;
};

app.use(
	session({
		genid: function (req) {
			return genuuid(20); // use UUIDs for session IDs
		},
		secret: process.env.SECRET,
		cookie: { maxAge: 60000 },
		resave: false,
		saveUninitialized: false,
	})
);
app.set("trust proxy", 1);

const mongodbLink = process.env.DB_LINK;

mongoose.connect(mongodbLink, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});

const User = require("./models/User");

const PORT = process.env.port || 3000;

app.get("/", (req, res) => {
	const user = req.session.user;

	if (!user) {
		res.redirect("/login");
	} else {
		const classes = user.classes;

		let matches = {};

		User.find(
			{ "classes.math": classes.math, email: { $not: { $eq: user.email } } },
			async (err, foundUsers) => {
				matches.math = foundUsers
					.sort((a, b) => Math.random() - 0.5)
					.filter((v, i) => i < 5);
				await User.find(
					{
						"classes.english": classes.english,
						email: { $not: { $eq: user.email } },
					},
					async (err, foundUsers) => {
						matches.english = foundUsers
							.sort((a, b) => Math.random() - 0.5)
							.filter((v, i) => i < 5);
						await User.find(
							{
								"classes.science": classes.science,
								email: { $not: { $eq: user.email } },
							},
							async (err, foundUsers) => {
								matches.science = foundUsers
									.sort((a, b) => Math.random() - 0.5)
									.filter((v, i) => i < 5);

								await User.find(
									{
										"classes.socialStudies": classes.socialStudies,
										email: { $not: { $eq: user.email } },
									},
									(err, foundUsers) => {
										matches.socialStudies = foundUsers
											.sort((a, b) => Math.random() - 0.5)
											.filter((v, i) => i < 5);
										res.render("index", {
											matches: matches,
											loggedInUser: user,
											successMsg: req.flash("success"),
											failureMsg: req.flash("failure"),
										});
									}
								);
							}
						);
					}
				);
			}
		);
	}
});

app.get("/register", (req, res) => {
	res.render("register", {
		loggedInUser: req.session.user,
		successMsg: req.flash("success"),
		failureMsg: req.flash("failure"),
	});
});

app.post("/register", (req, res) => {
	const data = req.body;
	User.find({ email: data.email }, (err, user) => {
		if (user.length) {
			req.flash("failure", "User already exists!");
			res.redirect("/register");
		} else {
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
			req.flash("success", "Successfully registered, please login!");
			res.redirect("/login");
		}
	});
});

app.get("/login", (req, res) => {
	res.render("login", {
		loggedInUser: req.session.user,
		successMsg: req.flash("success"),
		failureMsg: req.flash("failure"),
	});
});

app.post("/login", function (req, res) {
	User.findOne({ email: req.body.email }, (err, foundUser) => {
		if (err) {
			console.log(err);
		} else {
			if (!foundUser) return res.redirect("/login");
			if (bcrypt.compareSync(req.body.password, foundUser.password)) {
				req.session.user = foundUser;
				res.redirect("/");
			} else {
				req.flash("failure", "Incorrect email or password!");
				res.redirect("/login");
			}
		}
	});
});

app.get("/logout", (req, res) => {
	req.flash("success", "Successfully logged out");
	res.redirect("/login");
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
