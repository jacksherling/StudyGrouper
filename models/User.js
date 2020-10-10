const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	email: {
		type: String,
	},
	name: {
		type: String,
	},
	password: {
		type: String,
	},
	school: {
		type: String,
	},
	phone: {
		type: String,
	},
	classes: {
		math: {
			type: String,
		},
		english: {
			type: String,
		},
		science: {
			type: String,
		},
		socialStudies: {
			type: String,
		},
	},
});

module.exports = User = mongoose.model("user", userSchema);
