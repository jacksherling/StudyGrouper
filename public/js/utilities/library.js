// selector
const _ = (str, all = false) => (all ? document.querySelectorAll(str) : $(str));

// get/set attributes
Element.prototype.attr = function (key, val = false) {
	if (val) {
		this.setAttribute(key, val);
		return this;
	}
	return this.getAttribute(key);
};
