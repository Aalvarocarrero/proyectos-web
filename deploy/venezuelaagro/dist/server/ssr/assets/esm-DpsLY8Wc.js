import { PMTiles } from "./dist-D6jSFrrm.js";
//#region ../venezuela-agro-auth/node_modules/@mapbox/point-geometry/index.js
/**
* A standalone point geometry with useful accessor, comparison, and
* modification methods.
*
* @class
* @param {number} x the x-coordinate. This could be longitude or screen pixels, or any other sort of unit.
* @param {number} y the y-coordinate. This could be latitude or screen pixels, or any other sort of unit.
*
* @example
* const point = new Point(-77, 38);
*/
function Point(x, y) {
	this.x = x;
	this.y = y;
}
Point.prototype = {
	/**
	* Clone this point, returning a new point that can be modified
	* without affecting the old one.
	* @return {Point} the clone
	*/
	clone() {
		return new Point(this.x, this.y);
	},
	/**
	* Add this point's x & y coordinates to another point,
	* yielding a new point.
	* @param {Point} p the other point
	* @return {Point} output point
	*/
	add(p) {
		return this.clone()._add(p);
	},
	/**
	* Subtract this point's x & y coordinates to from point,
	* yielding a new point.
	* @param {Point} p the other point
	* @return {Point} output point
	*/
	sub(p) {
		return this.clone()._sub(p);
	},
	/**
	* Multiply this point's x & y coordinates by point,
	* yielding a new point.
	* @param {Point} p the other point
	* @return {Point} output point
	*/
	multByPoint(p) {
		return this.clone()._multByPoint(p);
	},
	/**
	* Divide this point's x & y coordinates by point,
	* yielding a new point.
	* @param {Point} p the other point
	* @return {Point} output point
	*/
	divByPoint(p) {
		return this.clone()._divByPoint(p);
	},
	/**
	* Multiply this point's x & y coordinates by a factor,
	* yielding a new point.
	* @param {number} k factor
	* @return {Point} output point
	*/
	mult(k) {
		return this.clone()._mult(k);
	},
	/**
	* Divide this point's x & y coordinates by a factor,
	* yielding a new point.
	* @param {number} k factor
	* @return {Point} output point
	*/
	div(k) {
		return this.clone()._div(k);
	},
	/**
	* Rotate this point around the 0, 0 origin by an angle a,
	* given in radians
	* @param {number} a angle to rotate around, in radians
	* @return {Point} output point
	*/
	rotate(a) {
		return this.clone()._rotate(a);
	},
	/**
	* Rotate this point around p point by an angle a,
	* given in radians
	* @param {number} a angle to rotate around, in radians
	* @param {Point} p Point to rotate around
	* @return {Point} output point
	*/
	rotateAround(a, p) {
		return this.clone()._rotateAround(a, p);
	},
	/**
	* Multiply this point by a 4x1 transformation matrix
	* @param {[number, number, number, number]} m transformation matrix
	* @return {Point} output point
	*/
	matMult(m) {
		return this.clone()._matMult(m);
	},
	/**
	* Calculate this point but as a unit vector from 0, 0, meaning
	* that the distance from the resulting point to the 0, 0
	* coordinate will be equal to 1 and the angle from the resulting
	* point to the 0, 0 coordinate will be the same as before.
	* @return {Point} unit vector point
	*/
	unit() {
		return this.clone()._unit();
	},
	/**
	* Compute a perpendicular point, where the new y coordinate
	* is the old x coordinate and the new x coordinate is the old y
	* coordinate multiplied by -1
	* @return {Point} perpendicular point
	*/
	perp() {
		return this.clone()._perp();
	},
	/**
	* Return a version of this point with the x & y coordinates
	* rounded to integers.
	* @return {Point} rounded point
	*/
	round() {
		return this.clone()._round();
	},
	/**
	* Return the magnitude of this point: this is the Euclidean
	* distance from the 0, 0 coordinate to this point's x and y
	* coordinates.
	* @return {number} magnitude
	*/
	mag() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},
	/**
	* Judge whether this point is equal to another point, returning
	* true or false.
	* @param {Point} other the other point
	* @return {boolean} whether the points are equal
	*/
	equals(other) {
		return this.x === other.x && this.y === other.y;
	},
	/**
	* Calculate the distance from this point to another point
	* @param {Point} p the other point
	* @return {number} distance
	*/
	dist(p) {
		return Math.sqrt(this.distSqr(p));
	},
	/**
	* Calculate the distance from this point to another point,
	* without the square root step. Useful if you're comparing
	* relative distances.
	* @param {Point} p the other point
	* @return {number} distance
	*/
	distSqr(p) {
		const dx = p.x - this.x, dy = p.y - this.y;
		return dx * dx + dy * dy;
	},
	/**
	* Get the angle from the 0, 0 coordinate to this point, in radians
	* coordinates.
	* @return {number} angle
	*/
	angle() {
		return Math.atan2(this.y, this.x);
	},
	/**
	* Get the angle from this point to another point, in radians
	* @param {Point} b the other point
	* @return {number} angle
	*/
	angleTo(b) {
		return Math.atan2(this.y - b.y, this.x - b.x);
	},
	/**
	* Get the angle between this point and another point, in radians
	* @param {Point} b the other point
	* @return {number} angle
	*/
	angleWith(b) {
		return this.angleWithSep(b.x, b.y);
	},
	/**
	* Find the angle of the two vectors, solving the formula for
	* the cross product a x b = |a||b|sin(θ) for θ.
	* @param {number} x the x-coordinate
	* @param {number} y the y-coordinate
	* @return {number} the angle in radians
	*/
	angleWithSep(x, y) {
		return Math.atan2(this.x * y - this.y * x, this.x * x + this.y * y);
	},
	/** @param {[number, number, number, number]} m */
	_matMult(m) {
		const x = m[0] * this.x + m[1] * this.y, y = m[2] * this.x + m[3] * this.y;
		this.x = x;
		this.y = y;
		return this;
	},
	/** @param {Point} p */
	_add(p) {
		this.x += p.x;
		this.y += p.y;
		return this;
	},
	/** @param {Point} p */
	_sub(p) {
		this.x -= p.x;
		this.y -= p.y;
		return this;
	},
	/** @param {number} k */
	_mult(k) {
		this.x *= k;
		this.y *= k;
		return this;
	},
	/** @param {number} k */
	_div(k) {
		this.x /= k;
		this.y /= k;
		return this;
	},
	/** @param {Point} p */
	_multByPoint(p) {
		this.x *= p.x;
		this.y *= p.y;
		return this;
	},
	/** @param {Point} p */
	_divByPoint(p) {
		this.x /= p.x;
		this.y /= p.y;
		return this;
	},
	_unit() {
		this._div(this.mag());
		return this;
	},
	_perp() {
		const y = this.y;
		this.y = this.x;
		this.x = -y;
		return this;
	},
	/** @param {number} angle */
	_rotate(angle) {
		const cos = Math.cos(angle), sin = Math.sin(angle), x = cos * this.x - sin * this.y, y = sin * this.x + cos * this.y;
		this.x = x;
		this.y = y;
		return this;
	},
	/**
	* @param {number} angle
	* @param {Point} p
	*/
	_rotateAround(angle, p) {
		const cos = Math.cos(angle), sin = Math.sin(angle), x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y), y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
		this.x = x;
		this.y = y;
		return this;
	},
	_round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	},
	constructor: Point
};
/**
* Construct a point from an array if necessary, otherwise if the input
* is already a Point, return it unchanged.
* @param {Point | [number, number] | {x: number, y: number}} p input value
* @return {Point} constructed point.
* @example
* // this
* var point = Point.convert([0, 1]);
* // is equivalent to
* var point = new Point(0, 1);
*/
Point.convert = function(p) {
	if (p instanceof Point) return p;
	if (Array.isArray(p)) return new Point(+p[0], +p[1]);
	if (p.x !== void 0 && p.y !== void 0) return new Point(+p.x, +p.y);
	throw new Error("Expected [x, y] or {x, y} point format");
};
//#endregion
//#region ../venezuela-agro-auth/node_modules/@protomaps/basemaps/dist/esm/index.js
var k = Object.defineProperty;
var r$1 = (a, e) => k(a, "name", {
	value: e,
	configurable: !0
});
function l(a, e) {
	let n = "script";
	return a === "name" ? n = "script" : a === "name2" ? n = "script2" : a === "name3" && (n = "script3"), [[
		"coalesce",
		["get", `pgf:${a}`],
		["get", a]
	], { "text-font": [
		"case",
		[
			"==",
			["get", n],
			"Devanagari"
		],
		["literal", ["Noto Sans Devanagari Regular v1"]],
		["literal", [e || "Noto Sans Regular"]]
	] }];
}
r$1(l, "get_name_block");
function c(a, e, n) {
	let i = "name";
	return n === "name" ? i = "" : n === "name2" ? i = "2" : n === "name3" && (i = "3"), e === "Latin" ? ["has", `script${i}`] : a === "ja" ? [
		"all",
		[
			"!=",
			["get", `script${i}`],
			"Han"
		],
		[
			"!=",
			["get", `script${i}`],
			"Hiragana"
		],
		[
			"!=",
			["get", `script${i}`],
			"Katakana"
		],
		[
			"!=",
			["get", `script${i}`],
			"Mixed-Japanese"
		]
	] : [
		"!=",
		["get", `script${i}`],
		e
	];
}
r$1(c, "is_not_in_target_script");
function s(a) {
	return a === "Devanagari" ? { "text-font": ["literal", ["Noto Sans Devanagari Regular v1"]] } : {};
}
r$1(s, "get_font_formatting");
function _(a) {
	let e = g.find((n) => n.lang === a);
	return e === void 0 ? "Latin" : e.script;
}
r$1(_, "get_default_script");
function d(a, e) {
	let n = e || _(a), i;
	return n === "Devanagari" ? i = "pgf:" : i = "", [
		"format",
		[
			"coalesce",
			["get", `${i}name:${a}`],
			["get", "name:en"]
		],
		s(n)
	];
}
r$1(d, "get_country_name");
function o(a, e, n) {
	let i = e || _(a), t;
	return i === "Devanagari" ? t = "pgf:" : t = "", [
		"case",
		[
			"all",
			[
				"any",
				["has", "name"],
				["has", "pgf:name"]
			],
			["!", [
				"any",
				["has", "name2"],
				["has", "pgf:name2"]
			]],
			["!", [
				"any",
				["has", "name3"],
				["has", "pgf:name3"]
			]]
		],
		[
			"case",
			c(a, i, "name"),
			[
				"case",
				[
					"any",
					["is-supported-script", ["get", "name"]],
					["has", "pgf:name"]
				],
				[
					"format",
					[
						"coalesce",
						["get", `${t}name:${a}`],
						["get", "name:en"]
					],
					s(i),
					`
`,
					{},
					[
						"case",
						[
							"all",
							["!", ["has", `${t}name:${a}`]],
							["has", "name:en"],
							["!", ["has", "script"]]
						],
						"",
						[
							"coalesce",
							["get", "pgf:name"],
							["get", "name"]
						]
					],
					{ "text-font": [
						"case",
						[
							"==",
							["get", "script"],
							"Devanagari"
						],
						["literal", ["Noto Sans Devanagari Regular v1"]],
						["literal", [n || "Noto Sans Regular"]]
					] }
				],
				["get", "name:en"]
			],
			[
				"format",
				[
					"coalesce",
					["get", `${t}name:${a}`],
					["get", "pgf:name"],
					["get", "name"]
				],
				s(i)
			]
		],
		[
			"all",
			[
				"any",
				["has", "name"],
				["has", "pgf:name"]
			],
			[
				"any",
				["has", "name2"],
				["has", "pgf:name2"]
			],
			["!", [
				"any",
				["has", "name3"],
				["has", "pgf:name3"]
			]]
		],
		[
			"case",
			[
				"all",
				c(a, i, "name"),
				c(a, i, "name2")
			],
			[
				"format",
				["get", `${t}name:${a}`],
				s(i),
				`
`,
				{},
				...l("name", n),
				`
`,
				{},
				...l("name2", n)
			],
			[
				"case",
				c(a, i, "name2"),
				[
					"format",
					[
						"coalesce",
						["get", `${t}name:${a}`],
						["get", "pgf:name"],
						["get", "name"]
					],
					s(i),
					`
`,
					{},
					...l("name2", n)
				],
				[
					"format",
					[
						"coalesce",
						["get", `${t}name:${a}`],
						["get", "pgf:name2"],
						["get", "name2"]
					],
					s(i),
					`
`,
					{},
					...l("name", n)
				]
			]
		],
		[
			"case",
			[
				"all",
				c(a, i, "name"),
				c(a, i, "name2"),
				c(a, i, "name3")
			],
			[
				"format",
				["get", `${t}name:${a}`],
				s(i),
				`
`,
				{},
				...l("name", n),
				`
`,
				{},
				...l("name2", n),
				`
`,
				{},
				...l("name3", n)
			],
			[
				"case",
				["!", c(a, i, "name")],
				[
					"format",
					[
						"coalesce",
						["get", `${t}name:${a}`],
						["get", "pgf:name"],
						["get", "name"]
					],
					s(i),
					`
`,
					{},
					...l("name2", n),
					`
`,
					{},
					...l("name3", n)
				],
				["!", c(a, i, "name2")],
				[
					"format",
					[
						"coalesce",
						["get", `${t}name:${a}`],
						["get", "pgf:name2"],
						["get", "name2"]
					],
					s(i),
					`
`,
					{},
					...l("name", n),
					`
`,
					{},
					...l("name3", n)
				],
				[
					"format",
					[
						"coalesce",
						["get", `${t}name:${a}`],
						["get", "pgf:name3"],
						["get", "name3"]
					],
					s(i),
					`
`,
					{},
					...l("name", n),
					`
`,
					{},
					...l("name2", n)
				]
			]
		]
	];
}
r$1(o, "get_multiline_name");
var g = [
	{
		lang: "ar",
		full_name: "Arabic",
		script: "Arabic"
	},
	{
		lang: "cs",
		full_name: "Czech",
		script: "Latin"
	},
	{
		lang: "bg",
		full_name: "Bulgarian",
		script: "Cyrillic"
	},
	{
		lang: "da",
		full_name: "Danish",
		script: "Latin"
	},
	{
		lang: "de",
		full_name: "German",
		script: "Latin"
	},
	{
		lang: "el",
		full_name: "Greek",
		script: "Greek"
	},
	{
		lang: "en",
		full_name: "English",
		script: "Latin"
	},
	{
		lang: "es",
		full_name: "Spanish",
		script: "Latin"
	},
	{
		lang: "et",
		full_name: "Estonian",
		script: "Latin"
	},
	{
		lang: "fa",
		full_name: "Persian",
		script: "Arabic"
	},
	{
		lang: "fi",
		full_name: "Finnish",
		script: "Latin"
	},
	{
		lang: "fr",
		full_name: "French",
		script: "Latin"
	},
	{
		lang: "ga",
		full_name: "Irish",
		script: "Latin"
	},
	{
		lang: "he",
		full_name: "Hebrew",
		script: "Hebrew"
	},
	{
		lang: "hi",
		full_name: "Hindi",
		script: "Devanagari"
	},
	{
		lang: "hr",
		full_name: "Croatian",
		script: "Latin"
	},
	{
		lang: "hu",
		full_name: "Hungarian",
		script: "Latin"
	},
	{
		lang: "id",
		full_name: "Indonesian",
		script: "Latin"
	},
	{
		lang: "it",
		full_name: "Italian",
		script: "Latin"
	},
	{
		lang: "ja",
		full_name: "Japanese",
		script: ""
	},
	{
		lang: "ko",
		full_name: "Korean",
		script: "Hangul"
	},
	{
		lang: "lt",
		full_name: "Lithuanian",
		script: "Latin"
	},
	{
		lang: "lv",
		full_name: "Latvian",
		script: "Latin"
	},
	{
		lang: "ne",
		full_name: "Nepali",
		script: "Devanagari"
	},
	{
		lang: "nl",
		full_name: "Dutch",
		script: "Latin"
	},
	{
		lang: "no",
		full_name: "Norwegian",
		script: "Latin"
	},
	{
		lang: "mr",
		full_name: "Marathi",
		script: "Devanagari"
	},
	{
		lang: "mt",
		full_name: "Maltese",
		script: "Latin"
	},
	{
		lang: "pl",
		full_name: "Polish",
		script: "Latin"
	},
	{
		lang: "pt",
		full_name: "Portuguese",
		script: "Latin"
	},
	{
		lang: "ro",
		full_name: "Romanian",
		script: "Latin"
	},
	{
		lang: "ru",
		full_name: "Russian",
		script: "Cyrillic"
	},
	{
		lang: "sk",
		full_name: "Slovak",
		script: "Latin"
	},
	{
		lang: "sl",
		full_name: "Slovenian",
		script: "Latin"
	},
	{
		lang: "sv",
		full_name: "Swedish",
		script: "Latin"
	},
	{
		lang: "tr",
		full_name: "Turkish",
		script: "Latin"
	},
	{
		lang: "uk",
		full_name: "Ukrainian",
		script: "Cyrillic"
	},
	{
		lang: "ur",
		full_name: "Urdu",
		script: "Arabic"
	},
	{
		lang: "vi",
		full_name: "Vietnamese",
		script: "Latin"
	},
	{
		lang: "zh-Hans",
		full_name: "Chinese (Simplified)",
		script: "Han"
	},
	{
		lang: "zh-Hant",
		full_name: "Chinese (Traditional)",
		script: "Han"
	}
];
function f(a, e) {
	return [
		{
			id: "background",
			type: "background",
			paint: { "background-color": e.background }
		},
		{
			id: "earth",
			type: "fill",
			filter: [
				"==",
				"$type",
				"Polygon"
			],
			source: a,
			"source-layer": "earth",
			paint: { "fill-color": e.earth }
		},
		...e.landcover ? [{
			id: "landcover",
			type: "fill",
			source: a,
			"source-layer": "landcover",
			paint: {
				"fill-color": [
					"match",
					["get", "kind"],
					"grassland",
					e.landcover.grassland,
					"barren",
					e.landcover.barren,
					"urban_area",
					e.landcover.urban_area,
					"farmland",
					e.landcover.farmland,
					"glacier",
					e.landcover.glacier,
					"scrub",
					e.landcover.scrub,
					e.landcover.forest
				],
				"fill-opacity": [
					"interpolate",
					["linear"],
					["zoom"],
					5,
					1,
					7,
					0
				]
			}
		}] : [],
		{
			id: "landuse_park",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: [
				"in",
				"kind",
				"national_park",
				"park",
				"cemetery",
				"protected_area",
				"nature_reserve",
				"forest",
				"golf_course",
				"wood",
				"scrub",
				"grassland",
				"grass",
				"glacier",
				"sand",
				"military",
				"naval_base",
				"airfield"
			],
			paint: {
				"fill-opacity": [
					"interpolate",
					["linear"],
					["zoom"],
					6,
					0,
					11,
					1
				],
				"fill-color": [
					"case",
					[
						"in",
						["get", "kind"],
						["literal", [
							"national_park",
							"park",
							"cemetery",
							"protected_area",
							"nature_reserve",
							"forest",
							"golf_course"
						]]
					],
					e.park_b,
					[
						"==",
						["get", "kind"],
						"wood"
					],
					e.wood_b,
					[
						"in",
						["get", "kind"],
						["literal", [
							"scrub",
							"grassland",
							"grass"
						]]
					],
					e.scrub_b,
					[
						"==",
						["get", "kind"],
						"glacier"
					],
					e.glacier,
					[
						"==",
						["get", "kind"],
						"sand"
					],
					e.sand,
					[
						"in",
						["get", "kind"],
						["literal", [
							"military",
							"naval_base",
							"airfield"
						]]
					],
					e.zoo,
					e.earth
				]
			}
		},
		{
			id: "landuse_urban_green",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: [
				"in",
				"kind",
				"allotments",
				"village_green",
				"playground"
			],
			paint: {
				"fill-color": e.park_b,
				"fill-opacity": .7
			}
		},
		{
			id: "landuse_hospital",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: [
				"==",
				"kind",
				"hospital"
			],
			paint: { "fill-color": e.hospital }
		},
		{
			id: "landuse_industrial",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: [
				"==",
				"kind",
				"industrial"
			],
			paint: { "fill-color": e.industrial }
		},
		{
			id: "landuse_school",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: [
				"in",
				"kind",
				"school",
				"university",
				"college"
			],
			paint: { "fill-color": e.school }
		},
		{
			id: "landuse_beach",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: [
				"in",
				"kind",
				"beach"
			],
			paint: { "fill-color": e.beach }
		},
		{
			id: "landuse_zoo",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: [
				"in",
				"kind",
				"zoo"
			],
			paint: { "fill-color": e.zoo }
		},
		{
			id: "landuse_aerodrome",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: [
				"in",
				"kind",
				"aerodrome"
			],
			paint: { "fill-color": e.aerodrome }
		},
		{
			id: "roads_runway",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"==",
				"kind_detail",
				"runway"
			],
			paint: {
				"line-color": e.runway,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					10,
					0,
					12,
					4,
					18,
					30
				]
			}
		},
		{
			id: "roads_taxiway",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 13,
			filter: [
				"==",
				"kind_detail",
				"taxiway"
			],
			paint: {
				"line-color": e.runway,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					13.5,
					1,
					15,
					6
				]
			}
		},
		{
			id: "landuse_runway",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: ["any", [
				"in",
				"kind",
				"runway",
				"taxiway"
			]],
			paint: { "fill-color": e.runway }
		},
		{
			id: "water",
			type: "fill",
			filter: [
				"==",
				"$type",
				"Polygon"
			],
			source: a,
			"source-layer": "water",
			paint: { "fill-color": e.water }
		},
		{
			id: "water_stream",
			type: "line",
			source: a,
			"source-layer": "water",
			minzoom: 14,
			filter: [
				"in",
				"kind",
				"stream"
			],
			paint: {
				"line-color": e.water,
				"line-width": .5
			}
		},
		{
			id: "water_river",
			type: "line",
			source: a,
			"source-layer": "water",
			minzoom: 9,
			filter: [
				"in",
				"kind",
				"river"
			],
			paint: {
				"line-color": e.water,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					9,
					0,
					9.5,
					1,
					18,
					12
				]
			}
		},
		{
			id: "landuse_pedestrian",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: [
				"in",
				"kind",
				"pedestrian",
				"dam"
			],
			paint: { "fill-color": e.pedestrian }
		},
		{
			id: "landuse_pier",
			type: "fill",
			source: a,
			"source-layer": "landuse",
			filter: [
				"==",
				"kind",
				"pier"
			],
			paint: { "fill-color": e.pier }
		},
		{
			id: "roads_tunnels_other_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_tunnel"],
				[
					"in",
					"kind",
					"other",
					"path"
				]
			],
			paint: {
				"line-color": e.tunnel_other_casing,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					14,
					0,
					20,
					7
				]
			}
		},
		{
			id: "roads_tunnels_minor_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_tunnel"],
				[
					"==",
					"kind",
					"minor_road"
				]
			],
			paint: {
				"line-color": e.tunnel_minor_casing,
				"line-dasharray": [3, 2],
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					11,
					0,
					12.5,
					.5,
					15,
					2,
					18,
					11
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					12,
					0,
					12.5,
					1
				]
			}
		},
		{
			id: "roads_tunnels_link_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_tunnel"],
				["has", "is_link"]
			],
			paint: {
				"line-color": e.tunnel_link_casing,
				"line-dasharray": [3, 2],
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					13.5,
					1,
					18,
					11
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					12,
					0,
					12.5,
					1
				]
			}
		},
		{
			id: "roads_tunnels_major_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"major_road"
				]
			],
			paint: {
				"line-color": e.tunnel_major_casing,
				"line-dasharray": [3, 2],
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					7,
					0,
					7.5,
					.5,
					18,
					13
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					9,
					0,
					9.5,
					1
				]
			}
		},
		{
			id: "roads_tunnels_highway_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"highway"
				],
				["!has", "is_link"]
			],
			paint: {
				"line-color": e.tunnel_highway_casing,
				"line-dasharray": [6, .5],
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					3,
					0,
					3.5,
					.5,
					18,
					15
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					7,
					0,
					7.5,
					1,
					20,
					15
				]
			}
		},
		{
			id: "roads_tunnels_other",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_tunnel"],
				[
					"in",
					"kind",
					"other",
					"path"
				]
			],
			paint: {
				"line-color": e.tunnel_other,
				"line-dasharray": [4.5, .5],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					14,
					0,
					20,
					7
				]
			}
		},
		{
			id: "roads_tunnels_minor",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_tunnel"],
				[
					"==",
					"kind",
					"minor_road"
				]
			],
			paint: {
				"line-color": e.tunnel_minor,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					11,
					0,
					12.5,
					.5,
					15,
					2,
					18,
					11
				]
			}
		},
		{
			id: "roads_tunnels_link",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_tunnel"],
				["has", "is_link"]
			],
			paint: {
				"line-color": e.tunnel_minor,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					13.5,
					1,
					18,
					11
				]
			}
		},
		{
			id: "roads_tunnels_major",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_tunnel"],
				[
					"==",
					"kind",
					"major_road"
				]
			],
			paint: {
				"line-color": e.tunnel_major,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					6,
					0,
					12,
					1.6,
					15,
					3,
					18,
					13
				]
			}
		},
		{
			id: "roads_tunnels_highway",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_tunnel"],
				[
					"==",
					["get", "kind"],
					"highway"
				],
				["!", ["has", "is_link"]]
			],
			paint: {
				"line-color": e.tunnel_highway,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					3,
					0,
					6,
					1.1,
					12,
					1.6,
					15,
					5,
					18,
					15
				]
			}
		},
		{
			id: "buildings",
			type: "fill",
			source: a,
			"source-layer": "buildings",
			filter: [
				"in",
				"kind",
				"building",
				"building_part"
			],
			paint: {
				"fill-color": e.buildings,
				"fill-opacity": .5
			}
		},
		{
			id: "roads_pier",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"==",
				"kind_detail",
				"pier"
			],
			paint: {
				"line-color": e.pier,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					12,
					0,
					12.5,
					.5,
					20,
					16
				]
			}
		},
		{
			id: "roads_minor_service_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 13,
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"minor_road"
				],
				[
					"==",
					"kind_detail",
					"service"
				]
			],
			paint: {
				"line-color": e.minor_service_casing,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					18,
					8
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					13.5,
					.8
				]
			}
		},
		{
			id: "roads_minor_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"minor_road"
				],
				[
					"!=",
					"kind_detail",
					"service"
				]
			],
			paint: {
				"line-color": e.minor_casing,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					11,
					0,
					12.5,
					.5,
					15,
					2,
					18,
					11
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					12,
					0,
					12.5,
					1
				]
			}
		},
		{
			id: "roads_link_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 13,
			filter: ["has", "is_link"],
			paint: {
				"line-color": e.minor_casing,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					13.5,
					1,
					18,
					11
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					13.5,
					1.5
				]
			}
		},
		{
			id: "roads_major_casing_late",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"major_road"
				]
			],
			paint: {
				"line-color": e.major_casing_late,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					6,
					0,
					12,
					1.6,
					15,
					3,
					18,
					13
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					9,
					0,
					9.5,
					1
				]
			}
		},
		{
			id: "roads_highway_casing_late",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"highway"
				],
				["!has", "is_link"]
			],
			paint: {
				"line-color": e.highway_casing_late,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					3,
					0,
					3.5,
					.5,
					18,
					15
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					7,
					0,
					7.5,
					1,
					20,
					15
				]
			}
		},
		{
			id: "roads_other",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"in",
					"kind",
					"other",
					"path"
				],
				[
					"!=",
					"kind_detail",
					"pier"
				]
			],
			paint: {
				"line-color": e.other,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					14,
					.5,
					20,
					12
				]
			}
		},
		{
			id: "roads_link",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: ["has", "is_link"],
			paint: {
				"line-color": e.link,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					13.5,
					1,
					18,
					11
				]
			}
		},
		{
			id: "roads_minor_service",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"minor_road"
				],
				[
					"==",
					"kind_detail",
					"service"
				]
			],
			paint: {
				"line-color": e.minor_service,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					18,
					8
				]
			}
		},
		{
			id: "roads_minor",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"minor_road"
				],
				[
					"!=",
					"kind_detail",
					"service"
				]
			],
			paint: {
				"line-color": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					11,
					e.minor_a,
					16,
					e.minor_b
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					11,
					0,
					12.5,
					.5,
					15,
					2,
					18,
					11
				]
			}
		},
		{
			id: "roads_major_casing_early",
			type: "line",
			source: a,
			"source-layer": "roads",
			maxzoom: 12,
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"major_road"
				]
			],
			paint: {
				"line-color": e.major_casing_early,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					7,
					0,
					7.5,
					.5,
					18,
					13
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					9,
					0,
					9.5,
					1
				]
			}
		},
		{
			id: "roads_major",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"major_road"
				]
			],
			paint: {
				"line-color": e.major,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					6,
					0,
					12,
					1.6,
					15,
					3,
					18,
					13
				]
			}
		},
		{
			id: "roads_highway_casing_early",
			type: "line",
			source: a,
			"source-layer": "roads",
			maxzoom: 12,
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"highway"
				],
				["!has", "is_link"]
			],
			paint: {
				"line-color": e.highway_casing_early,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					3,
					0,
					3.5,
					.5,
					18,
					15
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					7,
					0,
					7.5,
					1
				]
			}
		},
		{
			id: "roads_highway",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["!has", "is_tunnel"],
				["!has", "is_bridge"],
				[
					"==",
					"kind",
					"highway"
				],
				["!has", "is_link"]
			],
			paint: {
				"line-color": e.highway,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					3,
					0,
					6,
					1.1,
					12,
					1.6,
					15,
					5,
					18,
					15
				]
			}
		},
		{
			id: "roads_rail",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"==",
				"kind",
				"rail"
			],
			paint: {
				"line-dasharray": [.3, .75],
				"line-opacity": .5,
				"line-color": e.railway,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					3,
					0,
					6,
					.15,
					18,
					9
				]
			}
		},
		{
			id: "boundaries_country",
			type: "line",
			source: a,
			"source-layer": "boundaries",
			filter: [
				"<=",
				"kind_detail",
				2
			],
			paint: {
				"line-color": e.boundaries,
				"line-width": .7,
				"line-dasharray": [
					"step",
					["zoom"],
					["literal", [2, 0]],
					4,
					["literal", [2, 1]]
				]
			}
		},
		{
			id: "boundaries",
			type: "line",
			source: a,
			"source-layer": "boundaries",
			filter: [
				">",
				"kind_detail",
				2
			],
			paint: {
				"line-color": e.boundaries,
				"line-width": .4,
				"line-dasharray": [
					"step",
					["zoom"],
					["literal", [2, 0]],
					4,
					["literal", [2, 1]]
				]
			}
		},
		{
			id: "roads_bridges_other_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["has", "is_bridge"],
				[
					"in",
					"kind",
					"other",
					"path"
				]
			],
			paint: {
				"line-color": e.bridges_other_casing,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					14,
					0,
					20,
					7
				]
			}
		},
		{
			id: "roads_bridges_link_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["has", "is_bridge"],
				["has", "is_link"]
			],
			paint: {
				"line-color": e.bridges_minor_casing,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					13.5,
					1,
					18,
					11
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					12,
					0,
					12.5,
					1.5
				]
			}
		},
		{
			id: "roads_bridges_minor_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["has", "is_bridge"],
				[
					"==",
					"kind",
					"minor_road"
				]
			],
			paint: {
				"line-color": e.bridges_minor_casing,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					11,
					0,
					12.5,
					.5,
					15,
					2,
					18,
					11
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					13.5,
					.8
				]
			}
		},
		{
			id: "roads_bridges_major_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["has", "is_bridge"],
				[
					"==",
					"kind",
					"major_road"
				]
			],
			paint: {
				"line-color": e.bridges_major_casing,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					7,
					0,
					7.5,
					.5,
					18,
					10
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					9,
					0,
					9.5,
					1.5
				]
			}
		},
		{
			id: "roads_bridges_other",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["has", "is_bridge"],
				[
					"in",
					"kind",
					"other",
					"path"
				]
			],
			paint: {
				"line-color": e.bridges_other,
				"line-dasharray": [2, 1],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					14,
					0,
					20,
					7
				]
			}
		},
		{
			id: "roads_bridges_minor",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["has", "is_bridge"],
				[
					"==",
					"kind",
					"minor_road"
				]
			],
			paint: {
				"line-color": e.bridges_minor,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					11,
					0,
					12.5,
					.5,
					15,
					2,
					18,
					11
				]
			}
		},
		{
			id: "roads_bridges_link",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["has", "is_bridge"],
				["has", "is_link"]
			],
			paint: {
				"line-color": e.bridges_minor,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					13,
					0,
					13.5,
					1,
					18,
					11
				]
			}
		},
		{
			id: "roads_bridges_major",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["has", "is_bridge"],
				[
					"==",
					"kind",
					"major_road"
				]
			],
			paint: {
				"line-color": e.bridges_major,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					6,
					0,
					12,
					1.6,
					15,
					3,
					18,
					13
				]
			}
		},
		{
			id: "roads_bridges_highway_casing",
			type: "line",
			source: a,
			"source-layer": "roads",
			minzoom: 12,
			filter: [
				"all",
				["has", "is_bridge"],
				[
					"==",
					"kind",
					"highway"
				],
				["!has", "is_link"]
			],
			paint: {
				"line-color": e.bridges_highway_casing,
				"line-gap-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					3,
					0,
					3.5,
					.5,
					18,
					15
				],
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					7,
					0,
					7.5,
					1,
					20,
					15
				]
			}
		},
		{
			id: "roads_bridges_highway",
			type: "line",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				["has", "is_bridge"],
				[
					"==",
					"kind",
					"highway"
				],
				["!has", "is_link"]
			],
			paint: {
				"line-color": e.bridges_highway,
				"line-width": [
					"interpolate",
					["exponential", 1.6],
					["zoom"],
					3,
					0,
					6,
					1.1,
					12,
					1.6,
					15,
					5,
					18,
					15
				]
			}
		}
	];
}
r$1(f, "nolabels_layers");
function p(a, e, n, i) {
	return [
		{
			id: "address_label",
			type: "symbol",
			source: a,
			"source-layer": "buildings",
			minzoom: 18,
			filter: [
				"==",
				"kind",
				"address"
			],
			layout: {
				"symbol-placement": "point",
				"text-font": [e.italic || "Noto Sans Italic"],
				"text-field": ["get", "addr_housenumber"],
				"text-size": 12
			},
			paint: {
				"text-color": e.address_label,
				"text-halo-color": e.address_label_halo,
				"text-halo-width": 1
			}
		},
		{
			id: "water_waterway_label",
			type: "symbol",
			source: a,
			"source-layer": "water",
			minzoom: 13,
			filter: [
				"in",
				"kind",
				"river",
				"stream"
			],
			layout: {
				"symbol-placement": "line",
				"text-font": [e.italic || "Noto Sans Italic"],
				"text-field": o(n, i, e.regular),
				"text-size": 12,
				"text-letter-spacing": .2
			},
			paint: {
				"text-color": e.ocean_label,
				"text-halo-color": e.water,
				"text-halo-width": 1
			}
		},
		{
			id: "roads_oneway",
			type: "symbol",
			source: a,
			"source-layer": "roads",
			minzoom: 16,
			filter: [
				"==",
				["get", "oneway"],
				"yes"
			],
			layout: {
				"symbol-placement": "line",
				"icon-image": "arrow",
				"icon-rotate": 90,
				"symbol-spacing": 100
			}
		},
		{
			id: "roads_labels_minor",
			type: "symbol",
			source: a,
			"source-layer": "roads",
			minzoom: 15,
			filter: [
				"in",
				"kind",
				"minor_road",
				"other",
				"path"
			],
			layout: {
				"symbol-sort-key": ["get", "min_zoom"],
				"symbol-placement": "line",
				"text-font": [e.regular || "Noto Sans Regular"],
				"text-field": o(n, i, e.regular),
				"text-size": 12
			},
			paint: {
				"text-color": e.roads_label_minor,
				"text-halo-color": e.roads_label_minor_halo,
				"text-halo-width": 1
			}
		},
		{
			id: "water_label_ocean",
			type: "symbol",
			source: a,
			"source-layer": "water",
			filter: [
				"in",
				"kind",
				"sea",
				"ocean",
				"bay",
				"strait",
				"fjord"
			],
			layout: {
				"text-font": [e.italic || "Noto Sans Italic"],
				"text-field": o(n, i, e.regular),
				"text-size": [
					"interpolate",
					["linear"],
					["zoom"],
					3,
					10,
					10,
					12
				],
				"text-letter-spacing": .1,
				"text-max-width": 9,
				"text-transform": "uppercase"
			},
			paint: {
				"text-color": e.ocean_label,
				"text-halo-width": 1,
				"text-halo-color": e.water
			}
		},
		{
			id: "earth_label_islands",
			type: "symbol",
			source: a,
			"source-layer": "earth",
			filter: [
				"in",
				"kind",
				"island"
			],
			layout: {
				"text-font": [e.italic || "Noto Sans Italic"],
				"text-field": o(n, i, e.regular),
				"text-size": 10,
				"text-letter-spacing": .1,
				"text-max-width": 8
			},
			paint: {
				"text-color": e.subplace_label,
				"text-halo-color": e.subplace_label_halo,
				"text-halo-width": 1
			}
		},
		{
			id: "water_label_lakes",
			type: "symbol",
			source: a,
			"source-layer": "water",
			filter: [
				"in",
				"kind",
				"lake",
				"water"
			],
			layout: {
				"text-font": [e.italic || "Noto Sans Italic"],
				"text-field": o(n, i, e.regular),
				"text-size": [
					"interpolate",
					["linear"],
					["zoom"],
					3,
					10,
					6,
					12,
					10,
					12
				],
				"text-letter-spacing": .1,
				"text-max-width": 9
			},
			paint: {
				"text-color": e.ocean_label,
				"text-halo-color": e.water,
				"text-halo-width": 1
			}
		},
		{
			id: "roads_shields",
			type: "symbol",
			source: a,
			"source-layer": "roads",
			filter: [
				"all",
				[
					"in",
					["get", "kind"],
					["literal", ["highway", "major_road"]]
				],
				["has", "shield_text"],
				[
					"<=",
					["length", ["get", "shield_text"]],
					5
				]
			],
			layout: {
				"icon-image": [
					"match",
					["get", "network"],
					"US:I",
					[
						"concat",
						"US:I-",
						["length", ["get", "shield_text"]],
						"char"
					],
					"NL:S-road",
					[
						"concat",
						"NL:S-road-",
						["length", ["get", "shield_text"]],
						"char"
					],
					[
						"concat",
						"generic_shield-",
						["length", ["get", "shield_text"]],
						"char"
					]
				],
				"text-field": ["get", "shield_text"],
				"text-font": [e.bold || "Noto Sans Medium"],
				"text-size": 8,
				"icon-size": .8,
				"symbol-placement": "line",
				"icon-rotation-alignment": "viewport",
				"text-rotation-alignment": "viewport"
			},
			paint: { "text-color": e.roads_label_major }
		},
		{
			id: "roads_labels_major",
			type: "symbol",
			source: a,
			"source-layer": "roads",
			minzoom: 11,
			filter: [
				"in",
				"kind",
				"highway",
				"major_road"
			],
			layout: {
				"symbol-sort-key": ["get", "min_zoom"],
				"symbol-placement": "line",
				"text-font": [e.regular || "Noto Sans Regular"],
				"text-field": o(n, i, e.regular),
				"text-size": 12
			},
			paint: {
				"text-color": e.roads_label_major,
				"text-halo-color": e.roads_label_major_halo,
				"text-halo-width": 1
			}
		},
		...e.pois ? [{
			id: "pois",
			type: "symbol",
			source: a,
			"source-layer": "pois",
			filter: [
				"all",
				[
					"in",
					["get", "kind"],
					["literal", [
						"beach",
						"forest",
						"marina",
						"park",
						"peak",
						"zoo",
						"garden",
						"bench",
						"aerodrome",
						"station",
						"bus_stop",
						"ferry_terminal",
						"stadium",
						"university",
						"library",
						"school",
						"animal",
						"toilets",
						"drinking_water",
						"post_office",
						"building",
						"townhall",
						"restaurant",
						"fast_food",
						"cafe",
						"bar",
						"supermarket",
						"convenience",
						"books",
						"beauty",
						"electronics",
						"clothes",
						"attraction",
						"museum",
						"theatre",
						"artwork"
					]]
				],
				[
					">=",
					["zoom"],
					[
						"+",
						["get", "min_zoom"],
						0
					]
				]
			],
			layout: {
				"icon-image": [
					"match",
					["get", "kind"],
					"station",
					"train_station",
					["get", "kind"]
				],
				"text-font": [e.regular || "Noto Sans Regular"],
				"text-justify": "auto",
				"text-field": o(n, i, e.regular),
				"text-size": [
					"interpolate",
					["linear"],
					["zoom"],
					17,
					10,
					19,
					16
				],
				"text-max-width": 8,
				"text-offset": [1.1, 0],
				"text-variable-anchor": ["left", "right"]
			},
			paint: {
				"text-color": [
					"case",
					[
						"in",
						["get", "kind"],
						["literal", [
							"beach",
							"forest",
							"marina",
							"park",
							"peak",
							"zoo",
							"garden",
							"bench"
						]]
					],
					e.pois.green,
					[
						"in",
						["get", "kind"],
						["literal", [
							"aerodrome",
							"station",
							"bus_stop",
							"ferry_terminal"
						]]
					],
					e.pois.lapis,
					[
						"in",
						["get", "kind"],
						["literal", [
							"stadium",
							"university",
							"library",
							"school",
							"animal",
							"toilets",
							"drinking_water",
							"post_office",
							"building",
							"townhall"
						]]
					],
					e.pois.slategray,
					[
						"in",
						["get", "kind"],
						["literal", [
							"supermarket",
							"convenience",
							"books",
							"beauty",
							"electronics",
							"clothes"
						]]
					],
					e.pois.blue,
					[
						"in",
						["get", "kind"],
						["literal", [
							"restaurant",
							"fast_food",
							"cafe",
							"bar"
						]]
					],
					e.pois.tangerine,
					[
						"in",
						["get", "kind"],
						["literal", [
							"attraction",
							"museum",
							"theatre",
							"artwork"
						]]
					],
					e.pois.pink,
					e.earth
				],
				"text-halo-color": e.earth,
				"text-halo-width": 1
			}
		}] : [],
		{
			id: "places_subplace",
			type: "symbol",
			source: a,
			"source-layer": "places",
			filter: [
				"in",
				"kind",
				"neighbourhood",
				"macrohood"
			],
			layout: {
				"symbol-sort-key": [
					"case",
					["has", "sort_key"],
					["get", "sort_key"],
					["get", "min_zoom"]
				],
				"text-field": o(n, i, e.regular),
				"text-font": [e.regular || "Noto Sans Regular"],
				"text-max-width": 7,
				"text-letter-spacing": .1,
				"text-padding": [
					"interpolate",
					["linear"],
					["zoom"],
					5,
					2,
					8,
					4,
					12,
					18,
					15,
					20
				],
				"text-size": [
					"interpolate",
					["exponential", 1.2],
					["zoom"],
					11,
					8,
					14,
					14,
					18,
					24
				],
				"text-transform": "uppercase"
			},
			paint: {
				"text-color": e.subplace_label,
				"text-halo-color": e.subplace_label_halo,
				"text-halo-width": 1
			}
		},
		{
			id: "places_region",
			type: "symbol",
			source: a,
			"source-layer": "places",
			filter: [
				"==",
				"kind",
				"region"
			],
			layout: {
				"symbol-sort-key": ["get", "sort_key"],
				"text-field": [
					"step",
					["zoom"],
					[
						"coalesce",
						["get", "ref:en"],
						["get", "ref"]
					],
					6,
					o(n, i, e.regular)
				],
				"text-font": [e.regular || "Noto Sans Regular"],
				"text-size": [
					"interpolate",
					["linear"],
					["zoom"],
					3,
					11,
					7,
					16
				],
				"text-radial-offset": .2,
				"text-anchor": "center",
				"text-transform": "uppercase"
			},
			paint: {
				"text-color": e.state_label,
				"text-halo-color": e.state_label_halo,
				"text-halo-width": 1
			}
		},
		{
			id: "places_locality",
			type: "symbol",
			source: a,
			"source-layer": "places",
			filter: [
				"==",
				"kind",
				"locality"
			],
			layout: {
				"icon-image": [
					"step",
					["zoom"],
					[
						"case",
						[
							"==",
							["get", "capital"],
							"yes"
						],
						"capital",
						"townspot"
					],
					8,
					""
				],
				"icon-size": .7,
				"text-field": o(n, i, e.regular),
				"text-font": [
					"case",
					[
						"<=",
						["get", "min_zoom"],
						5
					],
					["literal", [e.bold || "Noto Sans Medium"]],
					["literal", [e.regular || "Noto Sans Regular"]]
				],
				"symbol-sort-key": [
					"case",
					["has", "sort_key"],
					["get", "sort_key"],
					["get", "min_zoom"]
				],
				"text-padding": [
					"interpolate",
					["linear"],
					["zoom"],
					5,
					3,
					8,
					7,
					12,
					11
				],
				"text-size": [
					"interpolate",
					["linear"],
					["zoom"],
					2,
					[
						"case",
						[
							"<",
							["get", "population_rank"],
							13
						],
						8,
						[
							">=",
							["get", "population_rank"],
							13
						],
						13,
						0
					],
					4,
					[
						"case",
						[
							"<",
							["get", "population_rank"],
							13
						],
						10,
						[
							">=",
							["get", "population_rank"],
							13
						],
						15,
						0
					],
					6,
					[
						"case",
						[
							"<",
							["get", "population_rank"],
							12
						],
						11,
						[
							">=",
							["get", "population_rank"],
							12
						],
						17,
						0
					],
					8,
					[
						"case",
						[
							"<",
							["get", "population_rank"],
							11
						],
						11,
						[
							">=",
							["get", "population_rank"],
							11
						],
						18,
						0
					],
					10,
					[
						"case",
						[
							"<",
							["get", "population_rank"],
							9
						],
						12,
						[
							">=",
							["get", "population_rank"],
							9
						],
						20,
						0
					],
					15,
					[
						"case",
						[
							"<",
							["get", "population_rank"],
							8
						],
						12,
						[
							">=",
							["get", "population_rank"],
							8
						],
						22,
						0
					]
				],
				"icon-padding": [
					"interpolate",
					["linear"],
					["zoom"],
					0,
					0,
					8,
					4,
					10,
					8,
					12,
					6,
					22,
					2
				],
				"text-justify": "auto",
				"text-variable-anchor": [
					"step",
					["zoom"],
					["literal", [
						"bottom",
						"left",
						"right",
						"top"
					]],
					8,
					["literal", ["center"]]
				],
				"text-radial-offset": .3
			},
			paint: {
				"text-color": e.city_label,
				"text-halo-color": e.city_label_halo,
				"text-halo-width": 1
			}
		},
		{
			id: "places_country",
			type: "symbol",
			source: a,
			"source-layer": "places",
			filter: [
				"==",
				"kind",
				"country"
			],
			layout: {
				"symbol-sort-key": [
					"case",
					["has", "sort_key"],
					["get", "sort_key"],
					["get", "min_zoom"]
				],
				"text-field": d(n, i),
				"text-font": [e.bold || "Noto Sans Medium"],
				"text-size": [
					"interpolate",
					["linear"],
					["zoom"],
					2,
					[
						"case",
						[
							"<",
							["get", "population_rank"],
							10
						],
						8,
						[
							">=",
							["get", "population_rank"],
							10
						],
						12,
						0
					],
					6,
					[
						"case",
						[
							"<",
							["get", "population_rank"],
							8
						],
						10,
						[
							">=",
							["get", "population_rank"],
							8
						],
						18,
						0
					],
					8,
					[
						"case",
						[
							"<",
							["get", "population_rank"],
							7
						],
						11,
						[
							">=",
							["get", "population_rank"],
							7
						],
						20,
						0
					]
				],
				"icon-padding": [
					"interpolate",
					["linear"],
					["zoom"],
					0,
					2,
					14,
					2,
					16,
					20,
					17,
					2,
					22,
					2
				],
				"text-transform": "uppercase"
			},
			paint: {
				"text-color": e.country_label,
				"text-halo-color": e.earth,
				"text-halo-width": 1
			}
		}
	];
}
r$1(p, "labels_layers");
var m = {
	background: "#cccccc",
	earth: "#e2dfda",
	park_a: "#cfddd5",
	park_b: "#9cd3b4",
	hospital: "#e4dad9",
	industrial: "#d1dde1",
	school: "#e4ded7",
	wood_a: "#d0ded0",
	wood_b: "#a0d9a0",
	pedestrian: "#e3e0d4",
	scrub_a: "#cedcd7",
	scrub_b: "#99d2bb",
	glacier: "#e7e7e7",
	sand: "#e2e0d7",
	beach: "#e8e4d0",
	aerodrome: "#dadbdf",
	runway: "#e9e9ed",
	water: "#80deea",
	zoo: "#c6dcdc",
	military: "#dcdcdc",
	tunnel_other_casing: "#e0e0e0",
	tunnel_minor_casing: "#e0e0e0",
	tunnel_link_casing: "#e0e0e0",
	tunnel_major_casing: "#e0e0e0",
	tunnel_highway_casing: "#e0e0e0",
	tunnel_other: "#d5d5d5",
	tunnel_minor: "#d5d5d5",
	tunnel_link: "#d5d5d5",
	tunnel_major: "#d5d5d5",
	tunnel_highway: "#d5d5d5",
	pier: "#e0e0e0",
	buildings: "#cccccc",
	minor_service_casing: "#e0e0e0",
	minor_casing: "#e0e0e0",
	link_casing: "#e0e0e0",
	major_casing_late: "#e0e0e0",
	highway_casing_late: "#e0e0e0",
	other: "#ebebeb",
	minor_service: "#ebebeb",
	minor_a: "#ebebeb",
	minor_b: "#ffffff",
	link: "#ffffff",
	major_casing_early: "#e0e0e0",
	major: "#ffffff",
	highway_casing_early: "#e0e0e0",
	highway: "#ffffff",
	railway: "#a7b1b3",
	boundaries: "#adadad",
	bridges_other_casing: "#e0e0e0",
	bridges_minor_casing: "#e0e0e0",
	bridges_link_casing: "#e0e0e0",
	bridges_major_casing: "#e0e0e0",
	bridges_highway_casing: "#e0e0e0",
	bridges_other: "#ebebeb",
	bridges_minor: "#ffffff",
	bridges_link: "#ffffff",
	bridges_major: "#f5f5f5",
	bridges_highway: "#ffffff",
	roads_label_minor: "#91888b",
	roads_label_minor_halo: "#ffffff",
	roads_label_major: "#938a8d",
	roads_label_major_halo: "#ffffff",
	ocean_label: "#728dd4",
	subplace_label: "#8f8f8f",
	subplace_label_halo: "#e0e0e0",
	city_label: "#5c5c5c",
	city_label_halo: "#e0e0e0",
	state_label: "#b3b3b3",
	state_label_halo: "#e0e0e0",
	country_label: "#a3a3a3",
	address_label: "#91888b",
	address_label_halo: "#ffffff",
	pois: {
		blue: "#1A8CBD",
		green: "#20834D",
		lapis: "#315BCF",
		pink: "#EF56BA",
		red: "#F2567A",
		slategray: "#6A5B8F",
		tangerine: "#CB6704",
		turquoise: "#00C3D4"
	},
	landcover: {
		grassland: "rgba(210, 239, 207, 1)",
		barren: "rgba(255, 243, 215, 1)",
		urban_area: "rgba(230, 230, 230, 1)",
		farmland: "rgba(216, 239, 210, 1)",
		glacier: "rgba(255, 255, 255, 1)",
		scrub: "rgba(234, 239, 210, 1)",
		forest: "rgba(196, 231, 210, 1)"
	}
}, b = {
	background: "#34373d",
	earth: "#1f1f1f",
	park_a: "#1c2421",
	park_b: "#192a24",
	hospital: "#252424",
	industrial: "#222222",
	school: "#262323",
	wood_a: "#202121",
	wood_b: "#202121",
	pedestrian: "#1e1e1e",
	scrub_a: "#222323",
	scrub_b: "#222323",
	glacier: "#1c1c1c",
	sand: "#212123",
	beach: "#28282a",
	aerodrome: "#1e1e1e",
	runway: "#333333",
	water: "#31353f",
	zoo: "#222323",
	military: "#242323",
	tunnel_other_casing: "#141414",
	tunnel_minor_casing: "#141414",
	tunnel_link_casing: "#141414",
	tunnel_major_casing: "#141414",
	tunnel_highway_casing: "#141414",
	tunnel_other: "#292929",
	tunnel_minor: "#292929",
	tunnel_link: "#292929",
	tunnel_major: "#292929",
	tunnel_highway: "#292929",
	pier: "#333333",
	buildings: "#111111",
	minor_service_casing: "#1f1f1f",
	minor_casing: "#1f1f1f",
	link_casing: "#1f1f1f",
	major_casing_late: "#1f1f1f",
	highway_casing_late: "#1f1f1f",
	other: "#333333",
	minor_service: "#333333",
	minor_a: "#3d3d3d",
	minor_b: "#333333",
	link: "#3d3d3d",
	major_casing_early: "#1f1f1f",
	major: "#3d3d3d",
	highway_casing_early: "#1f1f1f",
	highway: "#474747",
	railway: "#000000",
	boundaries: "#5b6374",
	bridges_other_casing: "#2b2b2b",
	bridges_minor_casing: "#1f1f1f",
	bridges_link_casing: "#1f1f1f",
	bridges_major_casing: "#1f1f1f",
	bridges_highway_casing: "#1f1f1f",
	bridges_other: "#333333",
	bridges_minor: "#333333",
	bridges_link: "#3d3d3d",
	bridges_major: "#3d3d3d",
	bridges_highway: "#474747",
	roads_label_minor: "#525252",
	roads_label_minor_halo: "#1f1f1f",
	roads_label_major: "#666666",
	roads_label_major_halo: "#1f1f1f",
	ocean_label: "#717784",
	subplace_label: "#525252",
	subplace_label_halo: "#1f1f1f",
	city_label: "#7a7a7a",
	city_label_halo: "#212121",
	state_label: "#3d3d3d",
	state_label_halo: "#1f1f1f",
	country_label: "#5c5c5c",
	address_label: "#525252",
	address_label_halo: "#1f1f1f",
	pois: {
		blue: "#4299BB",
		green: "#30C573",
		lapis: "#2B5CEA",
		pink: "#EF56BA",
		red: "#F2567A",
		slategray: "#93939F",
		tangerine: "#F19B6E",
		turquoise: "#00C3D4"
	},
	landcover: {
		grassland: "rgba(30, 41, 31, 1)",
		barren: "rgba(38, 38, 36, 1)",
		urban_area: "rgba(28, 28, 28, 1)",
		farmland: "rgba(31, 36, 32, 1)",
		glacier: "rgba(43, 43, 43, 1)",
		scrub: "rgba(34, 36, 30, 1)",
		forest: "rgba(28, 41, 37, 1)"
	}
}, h = {
	background: "#ffffff",
	earth: "#ffffff",
	park_a: "#fcfcfc",
	park_b: "#fcfcfc",
	hospital: "#f8f8f8",
	industrial: "#fcfcfc",
	school: "#f8f8f8",
	wood_a: "#fafafa",
	wood_b: "#fafafa",
	pedestrian: "#fdfdfd",
	scrub_a: "#fafafa",
	scrub_b: "#fafafa",
	glacier: "#fcfcfc",
	sand: "#fafafa",
	beach: "#f6f6f6",
	aerodrome: "#fdfdfd",
	runway: "#efefef",
	water: "#dcdcdc",
	zoo: "#f7f7f7",
	military: "#fcfcfc",
	tunnel_other_casing: "#d6d6d6",
	tunnel_minor_casing: "#fcfcfc",
	tunnel_link_casing: "#fcfcfc",
	tunnel_major_casing: "#fcfcfc",
	tunnel_highway_casing: "#fcfcfc",
	tunnel_other: "#d6d6d6",
	tunnel_minor: "#d6d6d6",
	tunnel_link: "#d6d6d6",
	tunnel_major: "#d6d6d6",
	tunnel_highway: "#d6d6d6",
	pier: "#efefef",
	buildings: "#efefef",
	minor_service_casing: "#ffffff",
	minor_casing: "#ffffff",
	link_casing: "#ffffff",
	major_casing_late: "#ffffff",
	highway_casing_late: "#ffffff",
	other: "#f5f5f5",
	minor_service: "#f5f5f5",
	minor_a: "#ebebeb",
	minor_b: "#f5f5f5",
	link: "#ebebeb",
	major_casing_early: "#ffffff",
	major: "#ebebeb",
	highway_casing_early: "#ffffff",
	highway: "#ebebeb",
	railway: "#d6d6d6",
	boundaries: "#adadad",
	bridges_other_casing: "#ffffff",
	bridges_minor_casing: "#ffffff",
	bridges_link_casing: "#ffffff",
	bridges_major_casing: "#ffffff",
	bridges_highway_casing: "#ffffff",
	bridges_other: "#f5f5f5",
	bridges_minor: "#f5f5f5",
	bridges_link: "#ebebeb",
	bridges_major: "#ebebeb",
	bridges_highway: "#ebebeb",
	roads_label_minor: "#adadad",
	roads_label_minor_halo: "#ffffff",
	roads_label_major: "#999999",
	roads_label_major_halo: "#ffffff",
	ocean_label: "#adadad",
	subplace_label: "#8f8f8f",
	subplace_label_halo: "#ffffff",
	city_label: "#5c5c5c",
	city_label_halo: "#ffffff",
	state_label: "#b3b3b3",
	state_label_halo: "#ffffff",
	country_label: "#b8b8b8",
	address_label: "#adadad",
	address_label_halo: "#ffffff"
}, u$1 = {
	background: "#a3a3a3",
	earth: "#cccccc",
	park_a: "#c2c2c2",
	park_b: "#c2c2c2",
	hospital: "#d0d0d0",
	industrial: "#c6c6c6",
	school: "#d0d0d0",
	wood_a: "#c2c2c2",
	wood_b: "#c2c2c2",
	pedestrian: "#c4c4c4",
	scrub_a: "#c2c2c2",
	scrub_b: "#c2c2c2",
	glacier: "#d2d2d2",
	sand: "#d2d2d2",
	beach: "#d2d2d2",
	aerodrome: "#c9c9c9",
	runway: "#f5f5f5",
	water: "#a3a3a3",
	zoo: "#c7c7c7",
	military: "#bfbfbf",
	tunnel_other_casing: "#b8b8b8",
	tunnel_minor_casing: "#b8b8b8",
	tunnel_link_casing: "#b8b8b8",
	tunnel_major_casing: "#b8b8b8",
	tunnel_highway_casing: "#b8b8b8",
	tunnel_other: "#d6d6d6",
	tunnel_minor: "#d6d6d6",
	tunnel_link: "#d6d6d6",
	tunnel_major: "#d6d6d6",
	tunnel_highway: "#d6d6d6",
	pier: "#b8b8b8",
	buildings: "#e0e0e0",
	minor_service_casing: "#cccccc",
	minor_casing: "#cccccc",
	link_casing: "#cccccc",
	major_casing_late: "#cccccc",
	highway_casing_late: "#cccccc",
	other: "#e0e0e0",
	minor_service: "#e0e0e0",
	minor_a: "#ebebeb",
	minor_b: "#e0e0e0",
	link: "#ebebeb",
	major_casing_early: "#cccccc",
	major: "#ebebeb",
	highway_casing_early: "#cccccc",
	highway: "#ebebeb",
	railway: "#f5f5f5",
	boundaries: "#5c5c5c",
	bridges_other_casing: "#cccccc",
	bridges_minor_casing: "#cccccc",
	bridges_link_casing: "#cccccc",
	bridges_major_casing: "#cccccc",
	bridges_highway_casing: "#cccccc",
	bridges_other: "#e0e0e0",
	bridges_minor: "#e0e0e0",
	bridges_link: "#ebebeb",
	bridges_major: "#ebebeb",
	bridges_highway: "#ebebeb",
	roads_label_minor: "#999999",
	roads_label_minor_halo: "#e0e0e0",
	roads_label_major: "#8f8f8f",
	roads_label_major_halo: "#ebebeb",
	ocean_label: "#7a7a7a",
	subplace_label: "#7a7a7a",
	subplace_label_halo: "#cccccc",
	city_label: "#474747",
	city_label_halo: "#cccccc",
	state_label: "#999999",
	state_label_halo: "#cccccc",
	country_label: "#858585",
	address_label: "#999999",
	address_label_halo: "#e0e0e0"
}, y = {
	background: "#2b2b2b",
	earth: "#141414",
	park_a: "#181818",
	park_b: "#181818",
	hospital: "#1d1d1d",
	industrial: "#101010",
	school: "#111111",
	wood_a: "#1a1a1a",
	wood_b: "#1a1a1a",
	pedestrian: "#191919",
	scrub_a: "#1c1c1c",
	scrub_b: "#1c1c1c",
	glacier: "#191919",
	sand: "#161616",
	beach: "#1f1f1f",
	aerodrome: "#191919",
	runway: "#323232",
	water: "#333333",
	zoo: "#191919",
	military: "#121212",
	tunnel_other_casing: "#101010",
	tunnel_minor_casing: "#101010",
	tunnel_link_casing: "#101010",
	tunnel_major_casing: "#101010",
	tunnel_highway_casing: "#101010",
	tunnel_other: "#292929",
	tunnel_minor: "#292929",
	tunnel_link: "#292929",
	tunnel_major: "#292929",
	tunnel_highway: "#292929",
	pier: "#0a0a0a",
	buildings: "#0a0a0a",
	minor_service_casing: "#141414",
	minor_casing: "#141414",
	link_casing: "#141414",
	major_casing_late: "#141414",
	highway_casing_late: "#141414",
	other: "#1f1f1f",
	minor_service: "#1f1f1f",
	minor_a: "#292929",
	minor_b: "#1f1f1f",
	link: "#1f1f1f",
	major_casing_early: "#141414",
	major: "#292929",
	highway_casing_early: "#141414",
	highway: "#292929",
	railway: "#292929",
	boundaries: "#707070",
	bridges_other_casing: "#141414",
	bridges_minor_casing: "#141414",
	bridges_link_casing: "#141414",
	bridges_major_casing: "#141414",
	bridges_highway_casing: "#141414",
	bridges_other: "#1f1f1f",
	bridges_minor: "#1f1f1f",
	bridges_link: "#292929",
	bridges_major: "#292929",
	bridges_highway: "#292929",
	roads_label_minor: "#525252",
	roads_label_minor_halo: "#141414",
	roads_label_major: "#5c5c5c",
	roads_label_major_halo: "#141414",
	ocean_label: "#707070",
	subplace_label: "#5c5c5c",
	subplace_label_halo: "#141414",
	city_label: "#999999",
	city_label_halo: "#141414",
	state_label: "#3d3d3d",
	state_label_halo: "#141414",
	country_label: "#707070",
	address_label: "#525252",
	address_label_halo: "#141414"
};
function C(a) {
	switch (a) {
		case "light": return m;
		case "dark": return b;
		case "white": return h;
		case "grayscale": return u$1;
		case "black": return y;
	}
	throw new Error("Flavor not found");
}
r$1(C, "namedFlavor");
function R$1(a, e, n) {
	let i = [];
	return n != null && n.labelsOnly || (i = f(a, e)), n != null && n.lang && (i = i.concat(p(a, e, n.lang))), i;
}
r$1(R$1, "layers");
//#endregion
//#region ../venezuela-agro-auth/node_modules/color2k/dist/index.exports.import.es.mjs
/**
* Clamps a number between a lower and upper bound.
*
* ```js
* guard(0, 1, 2); // 1
* ```
*
* @param low The lower bound.
* @param high The upper bound.
* @param value The number to clamp.
* @returns The clamped number.
*/
function guard(low, high, value) {
	return Math.min(Math.max(low, value), high);
}
/**
* Error thrown when color2k cannot parse an input color.
*
* ```js
* new ColorError('nope').message; // 'Failed to parse color: "nope"'
* ```
*
* @param color The color value that failed to parse.
*/
var ColorError = class extends Error {
	constructor(color) {
		super(`Failed to parse color: "${color}"`);
	}
};
/**
* Parses a color into red, green, blue, and alpha channel values.
*
* Supports hex, RGB, RGBA, HSL, HSLA, CSS named colors, and `transparent`.
*
* ```js
* parseToRgba('rgba(255, 0, 0, 0.5)'); // [255, 0, 0, 0.5]
* ```
*
* @param color The input color.
* @returns A tuple of red, green, blue, and alpha channel values.
*/
function parseToRgba(color) {
	if (typeof color !== "string") throw new ColorError(color);
	if (color.trim().toLowerCase() === "transparent") return [
		0,
		0,
		0,
		0
	];
	let normalizedColor = color.trim();
	normalizedColor = namedColorRegex.test(color) ? nameToHex(color) : color;
	const reducedHexMatch = reducedHexRegex.exec(normalizedColor);
	if (reducedHexMatch) {
		const arr = Array.from(reducedHexMatch).slice(1);
		return [...arr.slice(0, 3).map((x) => parseInt(r(x, 2), 16)), parseInt(r(arr[3] || "f", 2), 16) / 255];
	}
	const hexMatch = hexRegex.exec(normalizedColor);
	if (hexMatch) {
		const arr = Array.from(hexMatch).slice(1);
		return [...arr.slice(0, 3).map((x) => parseInt(x, 16)), parseInt(arr[3] || "ff", 16) / 255];
	}
	const rgbaMatch = rgbaRegex.exec(normalizedColor);
	if (rgbaMatch) {
		const arr = Array.from(rgbaMatch).slice(1);
		return [...arr.slice(0, 3).map((x) => parseInt(x, 10)), parseFloat(arr[3] || "1")];
	}
	const hslaMatch = hslaRegex.exec(normalizedColor);
	if (hslaMatch) {
		const [h, s, l, a] = Array.from(hslaMatch).slice(1).map(parseFloat);
		if (guard(0, 100, s) !== s) throw new ColorError(color);
		if (guard(0, 100, l) !== l) throw new ColorError(color);
		return [...hslToRgb(h, s, l), Number.isNaN(a) ? 1 : a];
	}
	throw new ColorError(color);
}
function hash(str) {
	let hash = 5381;
	let i = str.length;
	while (i) hash = hash * 33 ^ str.charCodeAt(--i);
	return (hash >>> 0) % 2341;
}
var colorToInt = (x) => parseInt(x.replace(/_/g, ""), 36);
var compressedColorMap = "1q29ehhb 1n09sgk7 1kl1ekf_ _yl4zsno 16z9eiv3 1p29lhp8 _bd9zg04 17u0____ _iw9zhe5 _to73___ _r45e31e _7l6g016 _jh8ouiv _zn3qba8 1jy4zshs 11u87k0u 1ro9yvyo 1aj3xael 1gz9zjz0 _3w8l4xo 1bf1ekf_ _ke3v___ _4rrkb__ 13j776yz _646mbhl _nrjr4__ _le6mbhl 1n37ehkb _m75f91n _qj3bzfz 1939yygw 11i5z6x8 _1k5f8xs 1509441m 15t5lwgf _ae2th1n _tg1ugcv 1lp1ugcv 16e14up_ _h55rw7n _ny9yavn _7a11xb_ 1ih442g9 _pv442g9 1mv16xof 14e6y7tu 1oo9zkds 17d1cisi _4v9y70f _y98m8kc 1019pq0v 12o9zda8 _348j4f4 1et50i2o _8epa8__ _ts6senj 1o350i2o 1mi9eiuo 1259yrp0 1ln80gnw _632xcoy 1cn9zldc _f29edu4 1n490c8q _9f9ziet 1b94vk74 _m49zkct 1kz6s73a 1eu9dtog _q58s1rz 1dy9sjiq __u89jo3 _aj5nkwg _ld89jo3 13h9z6wx _qa9z2ii _l119xgq _bs5arju 1hj4nwk9 1qt4nwk9 1ge6wau6 14j9zlcw 11p1edc_ _ms1zcxe _439shk6 _jt9y70f _754zsow 1la40eju _oq5p___ _x279qkz 1fa5r3rv _yd2d9ip _424tcku _8y1di2_ _zi2uabw _yy7rn9h 12yz980_ __39ljp6 1b59zg0x _n39zfzp 1fy9zest _b33k___ _hp9wq92 1il50hz4 _io472ub _lj9z3eo 19z9ykg0 _8t8iu3a 12b9bl4a 1ak5yw0o _896v4ku _tb8k8lv _s59zi6t _c09ze0p 1lg80oqn 1id9z8wb _238nba5 1kq6wgdi _154zssg _tn3zk49 _da9y6tc 1sg7cv4f _r12jvtt 1gq5fmkz 1cs9rvci _lp9jn1c _xw1tdnb 13f9zje6 16f6973h _vo7ir40 _bt5arjf _rc45e4t _hr4e100 10v4e100 _hc9zke2 _w91egv_ _sj2r1kk 13c87yx8 _vqpds__ _ni8ggk8 _tj9yqfb 1ia2j4r4 _7x9b10u 1fc9ld4j 1eq9zldr _5j9lhpx _ez9zl6o _md61fzm".split(" ").reduce((acc, next) => {
	const key = colorToInt(next.substring(0, 3));
	const hex = colorToInt(next.substring(3)).toString(16);
	let prefix = "";
	for (let i = 0; i < 6 - hex.length; i++) prefix += "0";
	acc[key] = `${prefix}${hex}`;
	return acc;
}, {});
/**
* Checks if a string is a CSS named color and returns its equivalent hex value, otherwise returns the original color.
*/
function nameToHex(color) {
	const result = compressedColorMap[hash(color.toLowerCase().trim())];
	if (!result) throw new ColorError(color);
	return `#${result}`;
}
var r = (str, amount) => Array.from(Array(amount)).map(() => str).join("");
var reducedHexRegex = new RegExp(`^#${r("([a-f0-9])", 3)}([a-f0-9])?$`, "i");
var hexRegex = new RegExp(`^#${r("([a-f0-9]{2})", 3)}([a-f0-9]{2})?$`, "i");
var rgbaRegex = new RegExp(`^rgba?\\(\\s*(\\d+)\\s*${r(",\\s*(\\d+)\\s*", 2)}(?:,\\s*([\\d.]+))?\\s*\\)$`, "i");
var hslaRegex = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i;
var namedColorRegex = /^[a-z]+$/i;
var roundColor = (color) => {
	return Math.round(color * 255);
};
var hslToRgb = (hue, saturation, lightness) => {
	let l = lightness / 100;
	if (saturation === 0) return [
		l,
		l,
		l
	].map(roundColor);
	const huePrime = (hue % 360 + 360) % 360 / 60;
	const chroma = (1 - Math.abs(2 * l - 1)) * (saturation / 100);
	const secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));
	let red = 0;
	let green = 0;
	let blue = 0;
	if (huePrime >= 0 && huePrime < 1) {
		red = chroma;
		green = secondComponent;
	} else if (huePrime >= 1 && huePrime < 2) {
		red = secondComponent;
		green = chroma;
	} else if (huePrime >= 2 && huePrime < 3) {
		green = chroma;
		blue = secondComponent;
	} else if (huePrime >= 3 && huePrime < 4) {
		green = secondComponent;
		blue = chroma;
	} else if (huePrime >= 4 && huePrime < 5) {
		red = secondComponent;
		blue = chroma;
	} else if (huePrime >= 5 && huePrime < 6) {
		red = chroma;
		blue = secondComponent;
	}
	const lightnessModification = l - chroma / 2;
	return [
		red + lightnessModification,
		green + lightnessModification,
		blue + lightnessModification
	].map(roundColor);
};
/**
* Builds an `rgba` color string from red, green, blue, and alpha channel
* values.
*
* ```js
* rgba(255, 0, 0, 1); // 'rgba(255, 0, 0, 1)'
* ```
*
* @param red The red channel value from 0 to 255.
* @param green The green channel value from 0 to 255.
* @param blue The blue channel value from 0 to 255.
* @param alpha The opacity as a decimal between 0 and 1.
* @returns An `rgba` color string.
*/
function rgba(red, green, blue, alpha) {
	return `rgba(${guard(0, 255, red).toFixed()}, ${guard(0, 255, green).toFixed()}, ${guard(0, 255, blue).toFixed()}, ${parseFloat(guard(0, 1, alpha).toFixed(3))})`;
}
/**
* Mixes two colors together using the Sass mix algorithm and returns an `rgba`
* color string.
*
* ```js
* mix('red', 'blue', 0.5); // 'rgba(128, 0, 128, 1)'
* ```
*
* @param color1 The first color.
* @param color2 The second color.
* @param weight The mix weight as a decimal between 0 and 1.
* @returns The mixed color as an `rgba` string.
*/
function mix(color1, color2, weight) {
	const normalize = (n, index) => index === 3 ? n : n / 255;
	const [r1, g1, b1, a1] = parseToRgba(color1).map(normalize);
	const [r2, g2, b2, a2] = parseToRgba(color2).map(normalize);
	const alphaDelta = a2 - a1;
	const normalizedWeight = weight * 2 - 1;
	const weight2 = ((normalizedWeight * alphaDelta === -1 ? normalizedWeight : normalizedWeight + alphaDelta / (1 + normalizedWeight * alphaDelta)) + 1) / 2;
	const weight1 = 1 - weight2;
	return rgba((r1 * weight1 + r2 * weight2) * 255, (g1 * weight1 + g2 * weight2) * 255, (b1 * weight1 + b2 * weight2) * 255, a2 * weight + a1 * (1 - weight));
}
//#endregion
//#region ../venezuela-agro-auth/node_modules/@mapbox/vector-tile/index.js
/** @import Pbf from 'pbf' */
/** @import {Feature} from 'geojson' */
var VectorTileFeature = class {
	/**
	* @param {Pbf} pbf
	* @param {number} end
	* @param {number} extent
	* @param {string[]} keys
	* @param {(number | string | boolean)[]} values
	*/
	constructor(pbf, end, extent, keys, values) {
		/** @type {Record<string, number | string | boolean>} */
		this.properties = Object.create(null);
		this.extent = extent;
		/** @type {0 | 1 | 2 | 3} */
		this.type = 0;
		/** @type {number | undefined} */
		this.id = void 0;
		/** @private */
		this._pbf = pbf;
		/** @private */
		this._geometry = -1;
		/** @private */
		this._keys = keys;
		/** @private */
		this._values = values;
		while (pbf.pos < end) {
			const tag = pbf.readVarint();
			if (tag === 8) this.id = pbf.readVarint();
			else if (tag === 18) {
				const tagsEnd = pbf.readVarint() + pbf.pos;
				while (pbf.pos < tagsEnd) {
					const key = keys[pbf.readVarint()];
					const value = values[pbf.readVarint()];
					this.properties[key] = value;
				}
			} else if (tag === 24) this.type = pbf.readVarint();
			else if (tag === 34) {
				this._geometry = pbf.pos;
				pbf.skip(tag);
			} else pbf.skip(tag);
		}
	}
	loadGeometry() {
		if (this._geometry < 0) throw new Error("feature has no geometry");
		const pbf = this._pbf;
		pbf.pos = this._geometry;
		const end = pbf.readVarint() + pbf.pos;
		/** @type Point[][] */
		const lines = [];
		/** @type Point[] | undefined */
		let line;
		let cmd = 1;
		let length = 0;
		let x = 0;
		let y = 0;
		while (pbf.pos < end) {
			if (length <= 0) {
				const cmdLen = pbf.readVarint();
				cmd = cmdLen & 7;
				length = cmdLen >> 3;
				if (length === 0) continue;
			}
			length--;
			if (cmd === 1) {
				x += pbf.readSVarint();
				y += pbf.readSVarint();
				if (line) lines.push(line);
				line = [new Point(x, y)];
			} else if (cmd === 2) {
				x += pbf.readSVarint();
				y += pbf.readSVarint();
				if (line) line.push(new Point(x, y));
			} else if (cmd === 7) {
				if (line) line.push(line[0].clone());
			} else throw new Error(`unknown command ${cmd}`);
		}
		if (line) lines.push(line);
		return lines;
	}
	bbox() {
		if (this._geometry < 0) throw new Error("feature has no geometry");
		const pbf = this._pbf;
		pbf.pos = this._geometry;
		const end = pbf.readVarint() + pbf.pos;
		let cmd = 1, length = 0, x = 0, y = 0, x1 = Infinity, x2 = -Infinity, y1 = Infinity, y2 = -Infinity;
		while (pbf.pos < end) {
			if (length <= 0) {
				const cmdLen = pbf.readVarint();
				cmd = cmdLen & 7;
				length = cmdLen >> 3;
				if (length === 0) continue;
			}
			length--;
			if (cmd === 1 || cmd === 2) {
				x += pbf.readSVarint();
				y += pbf.readSVarint();
				if (x < x1) x1 = x;
				if (x > x2) x2 = x;
				if (y < y1) y1 = y;
				if (y > y2) y2 = y;
			} else if (cmd !== 7) throw new Error(`unknown command ${cmd}`);
		}
		return [
			x1,
			y1,
			x2,
			y2
		];
	}
	/**
	* @param {number} x
	* @param {number} y
	* @param {number} z
	* @return {Feature}
	*/
	toGeoJSON(x, y, z) {
		const size = this.extent * Math.pow(2, z), x0 = this.extent * x, y0 = this.extent * y, vtCoords = this.loadGeometry();
		/** @param {Point} p */
		function projectPoint(p) {
			return [(p.x + x0) * 360 / size - 180, 360 / Math.PI * Math.atan(Math.exp((1 - (p.y + y0) * 2 / size) * Math.PI)) - 90];
		}
		/** @param {Point[]} line */
		function projectLine(line) {
			return line.map(projectPoint);
		}
		/** @type {Feature["geometry"]} */
		let geometry;
		if (this.type === 1) {
			const points = [];
			for (const line of vtCoords) points.push(line[0]);
			const coordinates = projectLine(points);
			geometry = points.length === 1 ? {
				type: "Point",
				coordinates: coordinates[0]
			} : {
				type: "MultiPoint",
				coordinates
			};
		} else if (this.type === 2) {
			const coordinates = vtCoords.map(projectLine);
			geometry = coordinates.length === 1 ? {
				type: "LineString",
				coordinates: coordinates[0]
			} : {
				type: "MultiLineString",
				coordinates
			};
		} else if (this.type === 3) {
			const polygons = classifyRings(vtCoords);
			const coordinates = [];
			for (const polygon of polygons) coordinates.push(polygon.map(projectLine));
			geometry = coordinates.length === 1 ? {
				type: "Polygon",
				coordinates: coordinates[0]
			} : {
				type: "MultiPolygon",
				coordinates
			};
		} else throw new Error("unknown feature type");
		/** @type {Feature} */
		const result = {
			type: "Feature",
			geometry,
			properties: this.properties
		};
		if (this.id != null) result.id = this.id;
		return result;
	}
};
/** @type {['Unknown', 'Point', 'LineString', 'Polygon']} */
VectorTileFeature.types = [
	"Unknown",
	"Point",
	"LineString",
	"Polygon"
];
/** classifies an array of rings into polygons with outer rings and holes
* @param {Point[][]} rings
*/
function classifyRings(rings) {
	const len = rings.length;
	if (len <= 1) return [rings];
	const polygons = [];
	let polygon, ccw;
	for (let i = 0; i < len; i++) {
		const area = signedArea(rings[i]);
		if (area === 0) continue;
		if (ccw === void 0) ccw = area < 0;
		if (ccw === area < 0) {
			if (polygon) polygons.push(polygon);
			polygon = [rings[i]];
		} else if (polygon) polygon.push(rings[i]);
	}
	if (polygon) polygons.push(polygon);
	return polygons;
}
/** @param {Point[]} ring */
function signedArea(ring) {
	let sum = 0;
	for (let i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
		p1 = ring[i];
		p2 = ring[j];
		sum += (p2.x - p1.x) * (p1.y + p2.y);
	}
	return sum;
}
var VectorTileLayer = class {
	/**
	* @param {Pbf} pbf
	* @param {number} [end]
	*/
	constructor(pbf, end) {
		this.version = 1;
		this.name = "";
		this.extent = 4096;
		this.length = 0;
		/** @private */
		this._pbf = pbf;
		/** @private
		* @type {string[]} */
		this._keys = [];
		/** @private
		* @type {(number | string | boolean)[]} */
		this._values = [];
		/** @private
		* @type {number[]} */
		this._features = [];
		if (end === void 0) end = pbf.length;
		while (pbf.pos < end) {
			const tag = pbf.readVarint();
			if (tag === 10) this.name = pbf.readString();
			else if (tag === 18) {
				this._features.push(pbf.pos);
				pbf.skip(tag);
			} else if (tag === 26) this._keys.push(pbf.readString());
			else if (tag === 34) this._values.push(readValueMessage(pbf));
			else if (tag === 40) this.extent = pbf.readVarint();
			else if (tag === 120) this.version = pbf.readVarint();
			else pbf.skip(tag);
		}
		this.length = this._features.length;
	}
	/** return feature `i` from this layer as a `VectorTileFeature`
	* @param {number} i
	*/
	feature(i) {
		if (i < 0 || i >= this._features.length) throw new Error("feature index out of bounds");
		this._pbf.pos = this._features[i];
		const end = this._pbf.readVarint() + this._pbf.pos;
		return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
	}
};
/**
* @param {Pbf} pbf
*/
function readValueMessage(pbf) {
	let value = null;
	const end = pbf.readVarint() + pbf.pos;
	while (pbf.pos < end) {
		const tag = pbf.readVarint();
		value = tag === 10 ? pbf.readString() : tag === 21 ? pbf.readFloat() : tag === 25 ? pbf.readDouble() : tag === 32 ? pbf.readVarint64() : tag === 40 ? pbf.readVarint() : tag === 48 ? pbf.readSVarint() : tag === 56 ? pbf.readBoolean() : (pbf.skip(tag), null);
	}
	if (value == null) throw new Error("unknown feature value");
	return value;
}
var VectorTile = class {
	/**
	* @param {Pbf} pbf
	* @param {number} [end]
	*/
	constructor(pbf, end = pbf.length) {
		/** @type {Record<string, VectorTileLayer>} */
		const layers = Object.create(null);
		while (pbf.pos < end) {
			const tag = pbf.readVarint();
			if (tag === 26) {
				const layer = new VectorTileLayer(pbf, pbf.readVarint() + pbf.pos);
				if (layer.length) layers[layer.name] = layer;
			} else pbf.skip(tag);
		}
		this.layers = layers;
	}
};
//#endregion
//#region ../venezuela-agro-auth/node_modules/pbf/index.js
var SHIFT_LEFT_32 = 65536 * 65536;
var SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
var TEXT_DECODER_MIN_LENGTH = 12;
var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");
var PBF_VARINT = 0;
var PBF_FIXED64 = 1;
var PBF_BYTES = 2;
var PBF_FIXED32 = 5;
var Pbf = class {
	/**
	* @param {Uint8Array | ArrayBuffer} [buf]
	*/
	constructor(buf = new Uint8Array(16)) {
		this.buf = ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf);
		this.dataView = new DataView(this.buf.buffer);
		this.pos = 0;
		this.type = 0;
		this.length = this.buf.length;
	}
	/**
	* @template T
	* @param {(tag: number, result: T, pbf: Pbf) => void} readField
	* @param {T} result
	* @param {number} [end]
	*/
	readFields(readField, result, end = this.length) {
		while (this.pos < end) {
			const val = this.readVarint(), tag = val >> 3, startPos = this.pos;
			this.type = val & 7;
			readField(tag, result, this);
			if (this.pos === startPos) this.skip(val);
		}
		return result;
	}
	/**
	* @template T
	* @param {(tag: number, result: T, pbf: Pbf) => void} readField
	* @param {T} result
	*/
	readMessage(readField, result) {
		return this.readFields(readField, result, this.readVarint() + this.pos);
	}
	readFixed32() {
		const val = this.dataView.getUint32(this.pos, true);
		this.pos += 4;
		return val;
	}
	readSFixed32() {
		const val = this.dataView.getInt32(this.pos, true);
		this.pos += 4;
		return val;
	}
	readFixed64() {
		const val = this.dataView.getUint32(this.pos, true) + this.dataView.getUint32(this.pos + 4, true) * SHIFT_LEFT_32;
		this.pos += 8;
		return val;
	}
	readSFixed64() {
		const val = this.dataView.getUint32(this.pos, true) + this.dataView.getInt32(this.pos + 4, true) * SHIFT_LEFT_32;
		this.pos += 8;
		return val;
	}
	readFloat() {
		const val = this.dataView.getFloat32(this.pos, true);
		this.pos += 4;
		return val;
	}
	readDouble() {
		const val = this.dataView.getFloat64(this.pos, true);
		this.pos += 8;
		return val;
	}
	/**
	* @param {boolean} [isSigned]
	*/
	readVarint(isSigned) {
		const buf = this.buf;
		let val, b;
		b = buf[this.pos++];
		val = b & 127;
		if (b < 128) return val;
		b = buf[this.pos++];
		val |= (b & 127) << 7;
		if (b < 128) return val;
		b = buf[this.pos++];
		val |= (b & 127) << 14;
		if (b < 128) return val;
		b = buf[this.pos++];
		val |= (b & 127) << 21;
		if (b < 128) return val;
		b = buf[this.pos];
		val |= (b & 15) << 28;
		return readVarintRemainder(val, isSigned, this);
	}
	readVarint64() {
		return this.readVarint(true);
	}
	readSVarint() {
		const num = this.readVarint();
		return num % 2 === 1 ? (num + 1) / -2 : num / 2;
	}
	readBoolean() {
		return Boolean(this.readVarint());
	}
	readString() {
		const end = this.readVarint() + this.pos;
		const pos = this.pos;
		this.pos = end;
		if (end - pos >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) return utf8TextDecoder.decode(this.buf.subarray(pos, end));
		return readUtf8(this.buf, pos, end);
	}
	readBytes() {
		const end = this.readVarint() + this.pos, buffer = this.buf.subarray(this.pos, end);
		this.pos = end;
		return buffer;
	}
	/**
	* @param {number[]} [arr]
	* @param {boolean} [isSigned]
	*/
	readPackedVarint(arr = [], isSigned) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readVarint(isSigned));
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedSVarint(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readSVarint());
		return arr;
	}
	/** @param {boolean[]} [arr] */
	readPackedBoolean(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readBoolean());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedFloat(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readFloat());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedDouble(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readDouble());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedFixed32(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readFixed32());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedSFixed32(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readSFixed32());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedFixed64(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readFixed64());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedSFixed64(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readSFixed64());
		return arr;
	}
	readPackedEnd() {
		return this.type === PBF_BYTES ? this.readVarint() + this.pos : this.pos + 1;
	}
	/** @param {number} val */
	skip(val) {
		const type = val & 7;
		if (type === PBF_VARINT) while (this.buf[this.pos++] > 127);
		else if (type === PBF_BYTES) this.pos = this.readVarint() + this.pos;
		else if (type === PBF_FIXED32) this.pos += 4;
		else if (type === PBF_FIXED64) this.pos += 8;
		else throw new Error(`Unimplemented type: ${type}`);
	}
	/**
	* @param {number} tag
	* @param {number} type
	*/
	writeTag(tag, type) {
		this.writeVarint(tag << 3 | type);
	}
	/** @param {number} min */
	realloc(min) {
		let length = this.length || 16;
		while (length < this.pos + min) length *= 2;
		if (length !== this.length) {
			const buf = new Uint8Array(length);
			buf.set(this.buf);
			this.buf = buf;
			this.dataView = new DataView(buf.buffer);
			this.length = length;
		}
	}
	finish() {
		this.length = this.pos;
		this.pos = 0;
		return this.buf.subarray(0, this.length);
	}
	/** @param {number} val */
	writeFixed32(val) {
		this.realloc(4);
		this.dataView.setInt32(this.pos, val, true);
		this.pos += 4;
	}
	/** @param {number} val */
	writeSFixed32(val) {
		this.realloc(4);
		this.dataView.setInt32(this.pos, val, true);
		this.pos += 4;
	}
	/** @param {number} val */
	writeFixed64(val) {
		this.realloc(8);
		this.dataView.setInt32(this.pos, val & -1, true);
		this.dataView.setInt32(this.pos + 4, Math.floor(val * SHIFT_RIGHT_32), true);
		this.pos += 8;
	}
	/** @param {number} val */
	writeSFixed64(val) {
		this.realloc(8);
		this.dataView.setInt32(this.pos, val & -1, true);
		this.dataView.setInt32(this.pos + 4, Math.floor(val * SHIFT_RIGHT_32), true);
		this.pos += 8;
	}
	/** @param {number} val */
	writeVarint(val) {
		val = +val || 0;
		if (val > 268435455 || val < 0) {
			writeBigVarint(val, this);
			return;
		}
		this.realloc(4);
		this.buf[this.pos++] = val & 127 | (val > 127 ? 128 : 0);
		if (val <= 127) return;
		this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
		if (val <= 127) return;
		this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
		if (val <= 127) return;
		this.buf[this.pos++] = val >>> 7 & 127;
	}
	/** @param {number} val */
	writeSVarint(val) {
		this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
	}
	/** @param {boolean} val */
	writeBoolean(val) {
		this.writeVarint(+val);
	}
	/** @param {string} str */
	writeString(str) {
		str = String(str);
		this.realloc(str.length * 4);
		this.pos++;
		const startPos = this.pos;
		this.pos = writeUtf8(this.buf, str, this.pos);
		const len = this.pos - startPos;
		if (len >= 128) makeRoomForExtraLength(startPos, len, this);
		this.pos = startPos - 1;
		this.writeVarint(len);
		this.pos += len;
	}
	/** @param {number} val */
	writeFloat(val) {
		this.realloc(4);
		this.dataView.setFloat32(this.pos, val, true);
		this.pos += 4;
	}
	/** @param {number} val */
	writeDouble(val) {
		this.realloc(8);
		this.dataView.setFloat64(this.pos, val, true);
		this.pos += 8;
	}
	/** @param {Uint8Array} buffer */
	writeBytes(buffer) {
		const len = buffer.length;
		this.writeVarint(len);
		this.realloc(len);
		for (let i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
	}
	/**
	* @template T
	* @param {(obj: T, pbf: Pbf) => void} fn
	* @param {T} obj
	*/
	writeRawMessage(fn, obj) {
		this.pos++;
		const startPos = this.pos;
		fn(obj, this);
		const len = this.pos - startPos;
		if (len >= 128) makeRoomForExtraLength(startPos, len, this);
		this.pos = startPos - 1;
		this.writeVarint(len);
		this.pos += len;
	}
	/**
	* @template T
	* @param {number} tag
	* @param {(obj: T, pbf: Pbf) => void} fn
	* @param {T} obj
	*/
	writeMessage(tag, fn, obj) {
		this.writeTag(tag, PBF_BYTES);
		this.writeRawMessage(fn, obj);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedVarint(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedVarint, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedSVarint(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);
	}
	/**
	* @param {number} tag
	* @param {boolean[]} arr
	*/
	writePackedBoolean(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedFloat(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedFloat, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedDouble(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedDouble, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedFixed32(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedSFixed32(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedFixed64(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedSFixed64(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr);
	}
	/**
	* @param {number} tag
	* @param {Uint8Array} buffer
	*/
	writeBytesField(tag, buffer) {
		this.writeTag(tag, PBF_BYTES);
		this.writeBytes(buffer);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeFixed32Field(tag, val) {
		this.writeTag(tag, PBF_FIXED32);
		this.writeFixed32(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeSFixed32Field(tag, val) {
		this.writeTag(tag, PBF_FIXED32);
		this.writeSFixed32(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeFixed64Field(tag, val) {
		this.writeTag(tag, PBF_FIXED64);
		this.writeFixed64(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeSFixed64Field(tag, val) {
		this.writeTag(tag, PBF_FIXED64);
		this.writeSFixed64(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeVarintField(tag, val) {
		this.writeTag(tag, PBF_VARINT);
		this.writeVarint(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeSVarintField(tag, val) {
		this.writeTag(tag, PBF_VARINT);
		this.writeSVarint(val);
	}
	/**
	* @param {number} tag
	* @param {string} str
	*/
	writeStringField(tag, str) {
		this.writeTag(tag, PBF_BYTES);
		this.writeString(str);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeFloatField(tag, val) {
		this.writeTag(tag, PBF_FIXED32);
		this.writeFloat(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeDoubleField(tag, val) {
		this.writeTag(tag, PBF_FIXED64);
		this.writeDouble(val);
	}
	/**
	* @param {number} tag
	* @param {boolean} val
	*/
	writeBooleanField(tag, val) {
		this.writeVarintField(tag, +val);
	}
};
/**
* @param {number} l
* @param {boolean | undefined} s
* @param {Pbf} p
*/
function readVarintRemainder(l, s, p) {
	const buf = p.buf;
	let h, b;
	b = buf[p.pos++];
	h = (b & 112) >> 4;
	if (b < 128) return toNum(l, h, s);
	b = buf[p.pos++];
	h |= (b & 127) << 3;
	if (b < 128) return toNum(l, h, s);
	b = buf[p.pos++];
	h |= (b & 127) << 10;
	if (b < 128) return toNum(l, h, s);
	b = buf[p.pos++];
	h |= (b & 127) << 17;
	if (b < 128) return toNum(l, h, s);
	b = buf[p.pos++];
	h |= (b & 127) << 24;
	if (b < 128) return toNum(l, h, s);
	b = buf[p.pos++];
	h |= (b & 1) << 31;
	if (b < 128) return toNum(l, h, s);
	throw new Error("Expected varint not more than 10 bytes");
}
/**
* @param {number} low
* @param {number} high
* @param {boolean} [isSigned]
*/
function toNum(low, high, isSigned) {
	return isSigned ? high * 4294967296 + (low >>> 0) : (high >>> 0) * 4294967296 + (low >>> 0);
}
/**
* @param {number} val
* @param {Pbf} pbf
*/
function writeBigVarint(val, pbf) {
	let low, high;
	if (val >= 0) {
		low = val % 4294967296 | 0;
		high = val / 4294967296 | 0;
	} else {
		low = ~(-val % 4294967296);
		high = ~(-val / 4294967296);
		if (low ^ 4294967295) low = low + 1 | 0;
		else {
			low = 0;
			high = high + 1 | 0;
		}
	}
	if (val >= 0x10000000000000000 || val < -0x10000000000000000) throw new Error("Given varint doesn't fit into 10 bytes");
	pbf.realloc(10);
	writeBigVarintLow(low, high, pbf);
	writeBigVarintHigh(high, pbf);
}
/**
* @param {number} high
* @param {number} low
* @param {Pbf} pbf
*/
function writeBigVarintLow(low, high, pbf) {
	pbf.buf[pbf.pos++] = low & 127 | 128;
	low >>>= 7;
	pbf.buf[pbf.pos++] = low & 127 | 128;
	low >>>= 7;
	pbf.buf[pbf.pos++] = low & 127 | 128;
	low >>>= 7;
	pbf.buf[pbf.pos++] = low & 127 | 128;
	low >>>= 7;
	pbf.buf[pbf.pos] = low & 127;
}
/**
* @param {number} high
* @param {Pbf} pbf
*/
function writeBigVarintHigh(high, pbf) {
	const lsb = (high & 7) << 4;
	pbf.buf[pbf.pos++] |= lsb | ((high >>>= 3) ? 128 : 0);
	if (!high) return;
	pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
	if (!high) return;
	pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
	if (!high) return;
	pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
	if (!high) return;
	pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
	if (!high) return;
	pbf.buf[pbf.pos++] = high & 127;
}
/**
* @param {number} startPos
* @param {number} len
* @param {Pbf} pbf
*/
function makeRoomForExtraLength(startPos, len, pbf) {
	const extraLen = len <= 16383 ? 1 : len <= 2097151 ? 2 : len <= 268435455 ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7));
	pbf.realloc(extraLen);
	for (let i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedVarint(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedSVarint(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedFloat(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedDouble(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);
}
/**
* @param {boolean[]} arr
* @param {Pbf} pbf
*/
function writePackedBoolean(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedFixed32(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedSFixed32(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedFixed64(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedSFixed64(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]);
}
/**
* @param {Uint8Array} buf
* @param {number} pos
* @param {number} end
*/
function readUtf8(buf, pos, end) {
	let str = "";
	let i = pos;
	while (i < end) {
		const b0 = buf[i];
		let c = null;
		let bytesPerSequence = b0 > 239 ? 4 : b0 > 223 ? 3 : b0 > 191 ? 2 : 1;
		if (i + bytesPerSequence > end) break;
		let b1, b2, b3;
		if (bytesPerSequence === 1) {
			if (b0 < 128) c = b0;
		} else if (bytesPerSequence === 2) {
			b1 = buf[i + 1];
			if ((b1 & 192) === 128) {
				c = (b0 & 31) << 6 | b1 & 63;
				if (c <= 127) c = null;
			}
		} else if (bytesPerSequence === 3) {
			b1 = buf[i + 1];
			b2 = buf[i + 2];
			if ((b1 & 192) === 128 && (b2 & 192) === 128) {
				c = (b0 & 15) << 12 | (b1 & 63) << 6 | b2 & 63;
				if (c <= 2047 || c >= 55296 && c <= 57343) c = null;
			}
		} else if (bytesPerSequence === 4) {
			b1 = buf[i + 1];
			b2 = buf[i + 2];
			b3 = buf[i + 3];
			if ((b1 & 192) === 128 && (b2 & 192) === 128 && (b3 & 192) === 128) {
				c = (b0 & 15) << 18 | (b1 & 63) << 12 | (b2 & 63) << 6 | b3 & 63;
				if (c <= 65535 || c >= 1114112) c = null;
			}
		}
		if (c === null) {
			c = 65533;
			bytesPerSequence = 1;
		} else if (c > 65535) {
			c -= 65536;
			str += String.fromCharCode(c >>> 10 & 1023 | 55296);
			c = 56320 | c & 1023;
		}
		str += String.fromCharCode(c);
		i += bytesPerSequence;
	}
	return str;
}
/**
* @param {Uint8Array} buf
* @param {string} str
* @param {number} pos
*/
function writeUtf8(buf, str, pos) {
	for (let i = 0, c, lead; i < str.length; i++) {
		c = str.charCodeAt(i);
		if (c > 55295 && c < 57344) if (lead) if (c < 56320) {
			buf[pos++] = 239;
			buf[pos++] = 191;
			buf[pos++] = 189;
			lead = c;
			continue;
		} else {
			c = lead - 55296 << 10 | c - 56320 | 65536;
			lead = null;
		}
		else {
			if (c > 56319 || i + 1 === str.length) {
				buf[pos++] = 239;
				buf[pos++] = 191;
				buf[pos++] = 189;
			} else lead = c;
			continue;
		}
		else if (lead) {
			buf[pos++] = 239;
			buf[pos++] = 191;
			buf[pos++] = 189;
			lead = null;
		}
		if (c < 128) buf[pos++] = c;
		else {
			if (c < 2048) buf[pos++] = c >> 6 | 192;
			else {
				if (c < 65536) buf[pos++] = c >> 12 | 224;
				else {
					buf[pos++] = c >> 18 | 240;
					buf[pos++] = c >> 12 & 63 | 128;
				}
				buf[pos++] = c >> 6 & 63 | 128;
			}
			buf[pos++] = c & 63 | 128;
		}
	}
	return pos;
}
//#endregion
//#region ../venezuela-agro-auth/node_modules/quickselect/index.js
function quickselect(arr, k, left, right, compare) {
	quickselectStep(arr, k, left || 0, right || arr.length - 1, compare || defaultCompare);
}
function quickselectStep(arr, k, left, right, compare) {
	while (right > left) {
		if (right - left > 600) {
			var n = right - left + 1;
			var m = k - left + 1;
			var z = Math.log(n);
			var s = .5 * Math.exp(2 * z / 3);
			var sd = .5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
			quickselectStep(arr, k, Math.max(left, Math.floor(k - m * s / n + sd)), Math.min(right, Math.floor(k + (n - m) * s / n + sd)), compare);
		}
		var t = arr[k];
		var i = left;
		var j = right;
		swap(arr, left, k);
		if (compare(arr[right], t) > 0) swap(arr, left, right);
		while (i < j) {
			swap(arr, i, j);
			i++;
			j--;
			while (compare(arr[i], t) < 0) i++;
			while (compare(arr[j], t) > 0) j--;
		}
		if (compare(arr[left], t) === 0) swap(arr, left, j);
		else {
			j++;
			swap(arr, j, right);
		}
		if (j <= k) left = j + 1;
		if (k <= j) right = j - 1;
	}
}
function swap(arr, i, j) {
	var tmp = arr[i];
	arr[i] = arr[j];
	arr[j] = tmp;
}
function defaultCompare(a, b) {
	return a < b ? -1 : a > b ? 1 : 0;
}
//#endregion
//#region ../venezuela-agro-auth/node_modules/rbush/index.js
var RBush = class {
	constructor(maxEntries = 9) {
		this._maxEntries = Math.max(4, maxEntries);
		this._minEntries = Math.max(2, Math.ceil(this._maxEntries * .4));
		this.clear();
	}
	all() {
		return this._all(this.data, []);
	}
	search(bbox) {
		let node = this.data;
		const result = [];
		if (!intersects(bbox, node)) return result;
		const toBBox = this.toBBox;
		const nodesToSearch = [];
		while (node) {
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				const childBBox = node.leaf ? toBBox(child) : child;
				if (intersects(bbox, childBBox)) if (node.leaf) result.push(child);
				else if (contains(bbox, childBBox)) this._all(child, result);
				else nodesToSearch.push(child);
			}
			node = nodesToSearch.pop();
		}
		return result;
	}
	collides(bbox) {
		let node = this.data;
		if (!intersects(bbox, node)) return false;
		const nodesToSearch = [];
		while (node) {
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				const childBBox = node.leaf ? this.toBBox(child) : child;
				if (intersects(bbox, childBBox)) {
					if (node.leaf || contains(bbox, childBBox)) return true;
					nodesToSearch.push(child);
				}
			}
			node = nodesToSearch.pop();
		}
		return false;
	}
	load(data) {
		if (!(data && data.length)) return this;
		if (data.length < this._minEntries) {
			for (let i = 0; i < data.length; i++) this.insert(data[i]);
			return this;
		}
		let node = this._build(data.slice(), 0, data.length - 1, 0);
		if (!this.data.children.length) this.data = node;
		else if (this.data.height === node.height) this._splitRoot(this.data, node);
		else {
			if (this.data.height < node.height) {
				const tmpNode = this.data;
				this.data = node;
				node = tmpNode;
			}
			this._insert(node, this.data.height - node.height - 1, true);
		}
		return this;
	}
	insert(item) {
		if (item) this._insert(item, this.data.height - 1);
		return this;
	}
	clear() {
		this.data = createNode([]);
		return this;
	}
	remove(item, equalsFn) {
		if (!item) return this;
		let node = this.data;
		const bbox = this.toBBox(item);
		const path = [];
		const indexes = [];
		let i, parent, goingUp;
		while (node || path.length) {
			if (!node) {
				node = path.pop();
				parent = path[path.length - 1];
				i = indexes.pop();
				goingUp = true;
			}
			if (node.leaf) {
				const index = findItem(item, node.children, equalsFn);
				if (index !== -1) {
					node.children.splice(index, 1);
					path.push(node);
					this._condense(path);
					return this;
				}
			}
			if (!goingUp && !node.leaf && contains(node, bbox)) {
				path.push(node);
				indexes.push(i);
				i = 0;
				parent = node;
				node = node.children[0];
			} else if (parent) {
				i++;
				node = parent.children[i];
				goingUp = false;
			} else node = null;
		}
		return this;
	}
	toBBox(item) {
		return item;
	}
	compareMinX(a, b) {
		return a.minX - b.minX;
	}
	compareMinY(a, b) {
		return a.minY - b.minY;
	}
	toJSON() {
		return this.data;
	}
	fromJSON(data) {
		this.data = data;
		return this;
	}
	_all(node, result) {
		const nodesToSearch = [];
		while (node) {
			if (node.leaf) result.push(...node.children);
			else nodesToSearch.push(...node.children);
			node = nodesToSearch.pop();
		}
		return result;
	}
	_build(items, left, right, height) {
		const N = right - left + 1;
		let M = this._maxEntries;
		let node;
		if (N <= M) {
			node = createNode(items.slice(left, right + 1));
			calcBBox(node, this.toBBox);
			return node;
		}
		if (!height) {
			height = Math.ceil(Math.log(N) / Math.log(M));
			M = Math.ceil(N / Math.pow(M, height - 1));
		}
		node = createNode([]);
		node.leaf = false;
		node.height = height;
		const N2 = Math.ceil(N / M);
		const N1 = N2 * Math.ceil(Math.sqrt(M));
		multiSelect(items, left, right, N1, this.compareMinX);
		for (let i = left; i <= right; i += N1) {
			const right2 = Math.min(i + N1 - 1, right);
			multiSelect(items, i, right2, N2, this.compareMinY);
			for (let j = i; j <= right2; j += N2) {
				const right3 = Math.min(j + N2 - 1, right2);
				node.children.push(this._build(items, j, right3, height - 1));
			}
		}
		calcBBox(node, this.toBBox);
		return node;
	}
	_chooseSubtree(bbox, node, level, path) {
		while (true) {
			path.push(node);
			if (node.leaf || path.length - 1 === level) break;
			let minArea = Infinity;
			let minEnlargement = Infinity;
			let targetNode;
			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				const area = bboxArea(child);
				const enlargement = enlargedArea(bbox, child) - area;
				if (enlargement < minEnlargement) {
					minEnlargement = enlargement;
					minArea = area < minArea ? area : minArea;
					targetNode = child;
				} else if (enlargement === minEnlargement) {
					if (area < minArea) {
						minArea = area;
						targetNode = child;
					}
				}
			}
			node = targetNode || node.children[0];
		}
		return node;
	}
	_insert(item, level, isNode) {
		const bbox = isNode ? item : this.toBBox(item);
		const insertPath = [];
		const node = this._chooseSubtree(bbox, this.data, level, insertPath);
		node.children.push(item);
		extend(node, bbox);
		while (level >= 0) if (insertPath[level].children.length > this._maxEntries) {
			this._split(insertPath, level);
			level--;
		} else break;
		this._adjustParentBBoxes(bbox, insertPath, level);
	}
	_split(insertPath, level) {
		const node = insertPath[level];
		const M = node.children.length;
		const m = this._minEntries;
		this._chooseSplitAxis(node, m, M);
		const splitIndex = this._chooseSplitIndex(node, m, M);
		const newNode = createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
		newNode.height = node.height;
		newNode.leaf = node.leaf;
		calcBBox(node, this.toBBox);
		calcBBox(newNode, this.toBBox);
		if (level) insertPath[level - 1].children.push(newNode);
		else this._splitRoot(node, newNode);
	}
	_splitRoot(node, newNode) {
		this.data = createNode([node, newNode]);
		this.data.height = node.height + 1;
		this.data.leaf = false;
		calcBBox(this.data, this.toBBox);
	}
	_chooseSplitIndex(node, m, M) {
		let index;
		let minOverlap = Infinity;
		let minArea = Infinity;
		for (let i = m; i <= M - m; i++) {
			const bbox1 = distBBox(node, 0, i, this.toBBox);
			const bbox2 = distBBox(node, i, M, this.toBBox);
			const overlap = intersectionArea(bbox1, bbox2);
			const area = bboxArea(bbox1) + bboxArea(bbox2);
			if (overlap < minOverlap) {
				minOverlap = overlap;
				index = i;
				minArea = area < minArea ? area : minArea;
			} else if (overlap === minOverlap) {
				if (area < minArea) {
					minArea = area;
					index = i;
				}
			}
		}
		return index || M - m;
	}
	_chooseSplitAxis(node, m, M) {
		const compareMinX = node.leaf ? this.compareMinX : compareNodeMinX;
		const compareMinY = node.leaf ? this.compareMinY : compareNodeMinY;
		if (this._allDistMargin(node, m, M, compareMinX) < this._allDistMargin(node, m, M, compareMinY)) node.children.sort(compareMinX);
	}
	_allDistMargin(node, m, M, compare) {
		node.children.sort(compare);
		const toBBox = this.toBBox;
		const leftBBox = distBBox(node, 0, m, toBBox);
		const rightBBox = distBBox(node, M - m, M, toBBox);
		let margin = bboxMargin(leftBBox) + bboxMargin(rightBBox);
		for (let i = m; i < M - m; i++) {
			const child = node.children[i];
			extend(leftBBox, node.leaf ? toBBox(child) : child);
			margin += bboxMargin(leftBBox);
		}
		for (let i = M - m - 1; i >= m; i--) {
			const child = node.children[i];
			extend(rightBBox, node.leaf ? toBBox(child) : child);
			margin += bboxMargin(rightBBox);
		}
		return margin;
	}
	_adjustParentBBoxes(bbox, path, level) {
		for (let i = level; i >= 0; i--) extend(path[i], bbox);
	}
	_condense(path) {
		for (let i = path.length - 1, siblings; i >= 0; i--) if (path[i].children.length === 0) if (i > 0) {
			siblings = path[i - 1].children;
			siblings.splice(siblings.indexOf(path[i]), 1);
		} else this.clear();
		else calcBBox(path[i], this.toBBox);
	}
};
function findItem(item, items, equalsFn) {
	if (!equalsFn) return items.indexOf(item);
	for (let i = 0; i < items.length; i++) if (equalsFn(item, items[i])) return i;
	return -1;
}
function calcBBox(node, toBBox) {
	distBBox(node, 0, node.children.length, toBBox, node);
}
function distBBox(node, k, p, toBBox, destNode) {
	if (!destNode) destNode = createNode(null);
	destNode.minX = Infinity;
	destNode.minY = Infinity;
	destNode.maxX = -Infinity;
	destNode.maxY = -Infinity;
	for (let i = k; i < p; i++) {
		const child = node.children[i];
		extend(destNode, node.leaf ? toBBox(child) : child);
	}
	return destNode;
}
function extend(a, b) {
	a.minX = Math.min(a.minX, b.minX);
	a.minY = Math.min(a.minY, b.minY);
	a.maxX = Math.max(a.maxX, b.maxX);
	a.maxY = Math.max(a.maxY, b.maxY);
	return a;
}
function compareNodeMinX(a, b) {
	return a.minX - b.minX;
}
function compareNodeMinY(a, b) {
	return a.minY - b.minY;
}
function bboxArea(a) {
	return (a.maxX - a.minX) * (a.maxY - a.minY);
}
function bboxMargin(a) {
	return a.maxX - a.minX + (a.maxY - a.minY);
}
function enlargedArea(a, b) {
	return (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) * (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY));
}
function intersectionArea(a, b) {
	const minX = Math.max(a.minX, b.minX);
	const minY = Math.max(a.minY, b.minY);
	const maxX = Math.min(a.maxX, b.maxX);
	const maxY = Math.min(a.maxY, b.maxY);
	return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
}
function contains(a, b) {
	return a.minX <= b.minX && a.minY <= b.minY && b.maxX <= a.maxX && b.maxY <= a.maxY;
}
function intersects(a, b) {
	return b.minX <= a.maxX && b.minY <= a.maxY && b.maxX >= a.minX && b.maxY >= a.minY;
}
function createNode(children) {
	return {
		children,
		height: 1,
		leaf: true,
		minX: Infinity,
		minY: Infinity,
		maxX: -Infinity,
		maxY: -Infinity
	};
}
function multiSelect(arr, left, right, n, compare) {
	const stack = [left, right];
	while (stack.length) {
		right = stack.pop();
		left = stack.pop();
		if (right - left <= n) continue;
		const mid = left + Math.ceil((right - left) / n / 2) * n;
		quickselect(arr, mid, left, right, compare);
		stack.push(left, mid, mid, right);
	}
}
//#endregion
//#region ../venezuela-agro-auth/node_modules/potpack/index.mjs
function potpack(boxes) {
	let area = 0;
	let maxWidth = 0;
	for (const box of boxes) {
		area += box.w * box.h;
		maxWidth = Math.max(maxWidth, box.w);
	}
	boxes.sort((a, b) => b.h - a.h);
	const spaces = [{
		x: 0,
		y: 0,
		w: Math.max(Math.ceil(Math.sqrt(area / .95)), maxWidth),
		h: Infinity
	}];
	let width = 0;
	let height = 0;
	for (const box of boxes) for (let i = spaces.length - 1; i >= 0; i--) {
		const space = spaces[i];
		if (box.w > space.w || box.h > space.h) continue;
		box.x = space.x;
		box.y = space.y;
		height = Math.max(height, box.y + box.h);
		width = Math.max(width, box.x + box.w);
		if (box.w === space.w && box.h === space.h) {
			const last = spaces.pop();
			if (i < spaces.length) spaces[i] = last;
		} else if (box.h === space.h) {
			space.x += box.w;
			space.w -= box.w;
		} else if (box.w === space.w) {
			space.y += box.h;
			space.h -= box.h;
		} else {
			spaces.push({
				x: space.x + box.w,
				y: space.y,
				w: space.w - box.w,
				h: box.h
			});
			space.y += box.h;
			space.h -= box.h;
		}
		break;
	}
	return {
		w: width,
		h: height,
		fill: area / (width * height) || 0
	};
}
//#endregion
//#region ../venezuela-agro-auth/node_modules/protomaps-leaflet/dist/esm/index.js
var bt = Object.defineProperty;
var S = Math.pow;
var u = (s, e) => bt(s, "name", {
	value: e,
	configurable: !0
});
var O = (s, e, t) => new Promise((r, n) => {
	var i = (a) => {
		try {
			l(t.next(a));
		} catch (c) {
			n(c);
		}
	}, o = (a) => {
		try {
			l(t.throw(a));
		} catch (c) {
			n(c);
		}
	}, l = (a) => a.done ? r(a.value) : Promise.resolve(a.value).then(i, o);
	l((t = t.apply(s, e)).next());
});
var de = class de {
	constructor(e, t) {
		this.str = e != null ? e : t, this.perFeature = typeof this.str == "function" && this.str.length === 2;
	}
	get(e, t) {
		return typeof this.str == "function" ? this.str(e, t) : this.str;
	}
};
u(de, "StringAttr");
var M = de, he = class he {
	constructor(e, t = 1) {
		this.value = e != null ? e : t, this.perFeature = typeof this.value == "function" && this.value.length === 2;
	}
	get(e, t) {
		return typeof this.value == "function" ? this.value(e, t) : this.value;
	}
};
u(he, "NumberAttr");
var v = he, be = class be {
	constructor(e) {
		var t;
		this.labelProps = (t = e == null ? void 0 : e.labelProps) != null ? t : ["name"], this.textTransform = e == null ? void 0 : e.textTransform;
	}
	get(e, t) {
		let r, n;
		typeof this.labelProps == "function" ? n = this.labelProps(e, t) : n = this.labelProps;
		for (let o of n) if (Object.prototype.hasOwnProperty.call(t.props, o) && typeof t.props[o] == "string") {
			r = t.props[o];
			break;
		}
		let i;
		return typeof this.textTransform == "function" ? i = this.textTransform(e, t) : i = this.textTransform, r && i === "uppercase" ? r = r.toUpperCase() : r && i === "lowercase" ? r = r.toLowerCase() : r && i === "capitalize" && (r = r.toLowerCase().split(" ").map((a) => a[0].toUpperCase() + a.slice(1)).join(" ")), r;
	}
};
u(be, "TextAttr");
var N = be, pe = class pe {
	constructor(e) {
		var t, r;
		e != null && e.font ? this.font = e.font : (this.family = (t = e == null ? void 0 : e.fontFamily) != null ? t : "sans-serif", this.size = (r = e == null ? void 0 : e.fontSize) != null ? r : 12, this.weight = e == null ? void 0 : e.fontWeight, this.style = e == null ? void 0 : e.fontStyle);
	}
	get(e, t) {
		if (this.font) return typeof this.font == "function" ? this.font(e, t) : this.font;
		let r = "";
		this.style && (typeof this.style == "function" ? r = `${this.style(e, t)} ` : r = `${this.style} `);
		let n = "";
		this.weight && (typeof this.weight == "function" ? n = `${this.weight(e, t)} ` : n = `${this.weight} `);
		let i;
		typeof this.size == "function" ? i = this.size(e, t) : i = this.size;
		let o;
		return typeof this.family == "function" ? o = this.family(e, t) : o = this.family, `${r}${n}${i}px ${o}`;
	}
};
u(pe, "FontAttr");
var E = pe, xe = class xe {
	constructor(e, t = []) {
		this.value = e != null ? e : t, this.perFeature = typeof this.value == "function" && this.value.length === 2;
	}
	get(e, t) {
		return typeof this.value == "function" ? this.value(e, t) : this.value;
	}
};
u(xe, "ArrayAttr");
var K = xe;
var pt = u((s, e, t) => {
	let r = [], n, i, o, l = 0, a = 0, c = 0, m = 0, d = 0, f = 0, b = 0, x = 0, g = 0, w = 0, k = 0, p = 0;
	if (s.length < 2) return [];
	if (s.length === 2) return c = Math.sqrt(S(s[1].x - s[0].x, 2) + S(s[1].y - s[0].y, 2)), [{
		length: c,
		beginIndex: 0,
		beginDistance: 0,
		endIndex: 2,
		endDistance: c
	}];
	for (m = Math.sqrt(S(s[1].x - s[0].x, 2) + S(s[1].y - s[0].y, 2)), l = 1, a = s.length - 1; l < a; l++) n = s[l - 1], i = s[l], o = s[l + 1], f = i.x - n.x, b = i.y - n.y, x = o.x - i.x, g = o.y - i.y, d = Math.sqrt(x * x + g * g), c += m, w = Math.acos((f * x + b * g) / (m * d)), (w > e || c - p > t) && (r.push({
		length: c - p,
		beginDistance: p,
		beginIndex: k,
		endIndex: l + 1,
		endDistance: c
	}), k = l, p = c), m = d;
	return l - k > 0 && r.push({
		length: c - p + d,
		beginIndex: k,
		beginDistance: p,
		endIndex: l + 1,
		endDistance: c + d
	}), r;
}, "linelabel");
function Ue(s, e, t, r) {
	let n = [];
	for (let i of s) {
		let o = pt(i, Math.PI / 45, e);
		for (let l of o) if (l.length >= e + r) {
			let a = new Point(i[l.beginIndex].x, i[l.beginIndex].y), c = i[l.endIndex - 1], m = new Point((c.x - a.x) / l.length, (c.y - a.y) / l.length);
			for (let d = r; d < l.length - e; d += t) n.push({
				start: a.add(m.mult(d)),
				end: a.add(m.mult(d + e))
			});
		}
	}
	return n;
}
u(Ue, "simpleLabel");
function Ge(s, e, t, r) {
	let n = e.x - s.x, i = e.y - s.y, o = Math.sqrt(S(e.x - s.x, 2) + S(e.y - s.y, 2)), l = [];
	for (let a = 0; a < t + r; a += 2 * r) {
		let c = a * 1 / o;
		l.push({
			x: s.x + c * n,
			y: s.y + c * i
		});
	}
	return l;
}
u(Ge, "lineCells");
function ge(s, e) {
	if (s.length <= e) return [s];
	let t = e - 1, r = s.lastIndexOf(" ", t), n = s.indexOf(" ", t);
	if (r === -1 && n === -1) return [s];
	let i, o;
	return n === -1 || r >= 0 && t - r < n - t ? (i = s.substring(0, r), o = s.substring(r + 1, s.length)) : (i = s.substring(0, n), o = s.substring(n + 1, s.length)), [i, ...ge(o, e)];
}
u(ge, "linebreak");
new RegExp(`^[々-〇〡-〩〱-〵〸-〼㈠-㈩㉈-㉏㉑-㉟㊀-㊉㊱-㊿㐀-䶵一-鿪豈-舘並-龎 ]+$`);
var we = ((r) => (r[r.Point = 1] = "Point", r[r.Line = 2] = "Line", r[r.Polygon = 3] = "Polygon", r))(we || {});
function B(s) {
	return `${s.x}:${s.y}:${s.z}`;
}
u(B, "toIndex");
var zt = u((s, e, t) => {
	s.pos = e;
	let r = s.readVarint() + s.pos, n = 1, i = 0, o = 0, l = 0, a = Infinity, c = -Infinity, m = Infinity, d = -Infinity, f = [], b = [];
	for (; s.pos < r;) {
		if (i <= 0) {
			let x = s.readVarint();
			n = x & 7, i = x >> 3;
		}
		if (i--, n === 1 || n === 2) o += s.readSVarint() * t, l += s.readSVarint() * t, o < a && (a = o), o > c && (c = o), l < m && (m = l), l > d && (d = l), n === 1 && (b.length > 0 && f.push(b), b = []), b.push(new Point(o, l));
		else if (n === 7) b && b.push(b[0].clone());
		else throw new Error(`unknown command ${n}`);
	}
	return b && f.push(b), {
		geom: f,
		bbox: {
			minX: a,
			minY: m,
			maxX: c,
			maxY: d
		}
	};
}, "loadGeomAndBbox");
function rt(s, e) {
	let t = new VectorTile(new Pbf(s)), r = /* @__PURE__ */ new Map();
	for (let [n, i] of Object.entries(t.layers)) {
		let o = [], l = i;
		for (let a = 0; a < l.length; a++) {
			let c = zt(l.feature(a)._pbf, l.feature(a)._geometry, e / l.extent), m = 0;
			for (let d of c.geom) m += d.length;
			o.push({
				id: l.feature(a).id,
				geomType: l.feature(a).type,
				geom: c.geom,
				numVertices: m,
				bbox: c.bbox,
				props: l.feature(a).properties
			});
		}
		r.set(n, o);
	}
	return r;
}
u(rt, "parseTile");
var ze = class ze {
	constructor(e, t) {
		typeof e == "string" ? this.p = new PMTiles(e) : this.p = e, this.zoomaborts = [], this.shouldCancelZooms = t;
	}
	get(e, t) {
		return O(this, null, function* () {
			this.shouldCancelZooms && (this.zoomaborts = this.zoomaborts.filter((o) => o.z !== e.z ? (o.controller.abort(), !1) : !0));
			let r = new AbortController();
			this.zoomaborts.push({
				z: e.z,
				controller: r
			});
			let n = r.signal, i = yield this.p.getZxy(e.z, e.x, e.y, n);
			return i ? rt(i.data, t) : /* @__PURE__ */ new Map();
		});
	}
};
u(ze, "PmtilesSource");
var H = ze, ke = class ke {
	constructor(e, t) {
		this.url = e, this.zoomaborts = [], this.shouldCancelZooms = t;
	}
	get(e, t) {
		return O(this, null, function* () {
			this.shouldCancelZooms && (this.zoomaborts = this.zoomaborts.filter((o) => o.z !== e.z ? (o.controller.abort(), !1) : !0));
			let r = this.url.replace("{z}", e.z.toString()).replace("{x}", e.x.toString()).replace("{y}", e.y.toString()), n = new AbortController();
			this.zoomaborts.push({
				z: e.z,
				controller: n
			});
			let i = n.signal;
			return new Promise((o, l) => {
				fetch(r, { signal: i }).then((a) => a.arrayBuffer()).then((a) => {
					o(rt(a, t));
				}).catch((a) => {
					l(a);
				});
			});
		});
	}
};
u(ke, "ZxySource");
var Q = ke, ye = 6378137, Qe = 85.0511287798, U = ye * Math.PI, kt = u((s) => {
	let e = Math.PI / 180, t = Math.max(Math.min(Qe, s[0]), -Qe), r = Math.sin(t * e);
	return new Point(ye * s[1] * e, ye * Math.log((1 + r) / (1 - r)) / 2);
}, "project");
function et(s) {
	return s * s;
}
u(et, "sqr");
function G(s, e) {
	return et(s.x - e.x) + et(s.y - e.y);
}
u(G, "dist2");
function Pt(s, e, t) {
	let r = G(e, t);
	if (r === 0) return G(s, e);
	let n = ((s.x - e.x) * (t.x - e.x) + (s.y - e.y) * (t.y - e.y)) / r;
	return n = Math.max(0, Math.min(1, n)), G(s, new Point(e.x + n * (t.x - e.x), e.y + n * (t.y - e.y)));
}
u(Pt, "distToSegmentSquared");
function tt(s, e) {
	let t = !1;
	for (let r = 0, n = e.length - 1; r < e.length; n = r++) {
		let i = e[r].x, o = e[r].y, l = e[n].x, a = e[n].y;
		o > s.y != a > s.y && s.x < (l - i) * (s.y - o) / (a - o) + i && (t = !t);
	}
	return t;
}
u(tt, "isInRing");
function vt(s) {
	let e = 0;
	for (let t = 0; t < s.length; t++) {
		let r = (t + 1) % s.length;
		e += s[t].x * s[r].y, e -= s[r].x * s[t].y;
	}
	return e < 0;
}
u(vt, "isCcw");
function Lt(s, e) {
	let t = !1;
	for (let r of e) if (vt(r)) tt(s, r) && (t = !1);
	else {
		if (t) return !0;
		tt(s, r) && (t = !0);
	}
	return t;
}
u(Lt, "pointInPolygon");
function Tt(s, e) {
	let t = Infinity;
	for (let r of e) {
		let n = Math.sqrt(G(s, r[0]));
		n < t && (t = n);
	}
	return t;
}
u(Tt, "pointMinDistToPoints");
function Ct(s, e) {
	let t = Infinity;
	for (let r of e) for (let n = 0; n < r.length - 1; n++) {
		let i = Math.sqrt(Pt(s, r[n], r[n + 1]));
		i < t && (t = i);
	}
	return t;
}
u(Ct, "pointMinDistToLines");
var Pe = class Pe {
	constructor(e, t) {
		this.source = e, this.cache = /* @__PURE__ */ new Map(), this.inflight = /* @__PURE__ */ new Map(), this.tileSize = t;
	}
	get(e) {
		return O(this, null, function* () {
			let t = B(e);
			return new Promise((r, n) => {
				let i = this.cache.get(t);
				if (i) i.used = performance.now(), r(i.data);
				else {
					let o = this.inflight.get(t);
					o ? o.push({
						resolve: r,
						reject: n
					}) : (this.inflight.set(t, []), this.source.get(e, this.tileSize).then((l) => {
						this.cache.set(t, {
							used: performance.now(),
							data: l
						});
						let a = this.inflight.get(t);
						if (a) for (let c of a) c.resolve(l);
						if (this.inflight.delete(t), r(l), this.cache.size >= 64) {
							let c = Infinity, m;
							this.cache.forEach((d, f) => {
								d.used < c && (c = d.used, m = f);
							}), m && this.cache.delete(m);
						}
					}).catch((l) => {
						let a = this.inflight.get(t);
						if (a) for (let c of a) c.reject(l);
						this.inflight.delete(t), n(l);
					}));
				}
			});
		});
	}
	queryFeatures(e, t, r, n) {
		let i = kt([t, e]), o = new Point((i.x + U) / (U * 2), 1 - (i.y + U) / (U * 2));
		o.x > 1 && (o.x = o.x - Math.floor(o.x));
		let l = o.mult(1 << r), a = Math.floor(l.x), c = Math.floor(l.y), m = B({
			z: r,
			x: a,
			y: c
		}), d = [], f = this.cache.get(m);
		if (f) {
			let b = new Point((l.x - a) * this.tileSize, (l.y - c) * this.tileSize);
			for (let [x, g] of f.data.entries()) for (let w of g) w.geomType === 1 ? Tt(b, w.geom) < n && d.push({
				feature: w,
				layerName: x
			}) : w.geomType === 2 ? Ct(b, w.geom) < n && d.push({
				feature: w,
				layerName: x
			}) : Lt(b, w.geom) && d.push({
				feature: w,
				layerName: x
			});
		}
		return d;
	}
};
u(Pe, "TileCache");
var ee = Pe;
var St = ((r) => (r[r.Left = 1] = "Left", r[r.Center = 2] = "Center", r[r.Right = 3] = "Right", r))(St || {}), At = ((a) => (a[a.N = 1] = "N", a[a.Ne = 2] = "Ne", a[a.E = 3] = "E", a[a.Se = 4] = "Se", a[a.S = 5] = "S", a[a.Sw = 6] = "Sw", a[a.W = 7] = "W", a[a.Nw = 8] = "Nw", a))(At || {}), yr = u((s, e, t) => {
	let r = document.createElement("canvas"), n = r.getContext("2d");
	return r.width = s, r.height = e, n !== null && t(r, n), r;
}, "createPattern"), Ce = class Ce {
	constructor(e) {
		var t;
		this.pattern = e.pattern, this.fill = new M(e.fill, "black"), this.opacity = new v(e.opacity, 1), this.stroke = new M(e.stroke, "black"), this.width = new v(e.width, 0), this.perFeature = (t = this.fill.perFeature || this.opacity.perFeature || this.stroke.perFeature || this.width.perFeature || e.perFeature) != null ? t : !1, this.doStroke = !1;
	}
	before(e, t) {
		if (!this.perFeature) {
			e.globalAlpha = this.opacity.get(t), e.fillStyle = this.fill.get(t), e.strokeStyle = this.stroke.get(t);
			let r = this.width.get(t);
			r > 0 && (this.doStroke = !0), e.lineWidth = r;
		}
		if (this.pattern) {
			let r = e.createPattern(this.pattern, "repeat");
			r && (e.fillStyle = r);
		}
	}
	draw(e, t, r, n) {
		let i = !1;
		if (this.perFeature) {
			e.globalAlpha = this.opacity.get(r, n), e.fillStyle = this.fill.get(r, n);
			let l = this.width.get(r, n);
			l && (i = !0, e.strokeStyle = this.stroke.get(r, n), e.lineWidth = l);
		}
		let o = u(() => {
			e.fill(), (i || this.doStroke) && e.stroke();
		}, "drawPath");
		e.beginPath();
		for (let l of t) for (let a = 0; a < l.length; a++) {
			let c = l[a];
			a === 0 ? e.moveTo(c.x, c.y) : e.lineTo(c.x, c.y);
		}
		o();
	}
};
u(Ce, "PolygonSymbolizer");
var T = Ce;
function wr(s, e) {
	return (t) => {
		let r = t - s;
		return r >= 0 && r < e.length ? e[r] : 0;
	};
}
u(wr, "arr");
function Dt(s, e) {
	let t = 0;
	for (; e[t + 1][0] < s;) t++;
	return t;
}
u(Dt, "getStopIndex");
function Ot(s, e, t) {
	return s * (t - e) + e;
}
u(Ot, "interpolate");
function Mt(s, e, t, r) {
	let n = r[e + 1][0] - r[e][0], i = s - r[e][0];
	return n === 0 ? 0 : t === 1 ? i / n : (S(t, i) - 1) / (S(t, n) - 1);
}
u(Mt, "computeInterpolationFactor");
function Y(s, e) {
	return (t) => {
		if (e.length < 1) return 0;
		if (t <= e[0][0]) return e[0][1];
		if (t >= e[e.length - 1][0]) return e[e.length - 1][1];
		let r = Dt(t, e);
		return Ot(Mt(t, r, s, e), e[r][1], e[r + 1][1]);
	};
}
u(Y, "exp");
function zr(s, e) {
	return (t) => {
		if (e.length < 1) return 0;
		let r = s;
		for (let n = 0; n < e.length; n++) t >= e[n][0] && (r = e[n][1]);
		return r;
	};
}
u(zr, "step");
function Te(s) {
	return Y(1, s);
}
u(Te, "linear");
var Se = class Se {
	constructor(e) {
		var t;
		this.color = new M(e.color, "black"), this.width = new v(e.width), this.opacity = new v(e.opacity), this.dash = e.dash ? new K(e.dash) : null, this.dashColor = new M(e.dashColor, "black"), this.dashWidth = new v(e.dashWidth, 1), this.lineCap = new M(e.lineCap, "butt"), this.lineJoin = new M(e.lineJoin, "miter"), this.skip = !1, this.perFeature = !!((t = this.dash) != null && t.perFeature || this.color.perFeature || this.opacity.perFeature || this.width.perFeature || this.lineCap.perFeature || this.lineJoin.perFeature || e.perFeature);
	}
	before(e, t) {
		this.perFeature || (e.strokeStyle = this.color.get(t), e.lineWidth = this.width.get(t), e.globalAlpha = this.opacity.get(t), e.lineCap = this.lineCap.get(t), e.lineJoin = this.lineJoin.get(t));
	}
	draw(e, t, r, n) {
		if (this.skip) return;
		let i = u(() => {
			this.perFeature && (e.globalAlpha = this.opacity.get(r, n), e.lineCap = this.lineCap.get(r, n), e.lineJoin = this.lineJoin.get(r, n)), this.dash ? (e.save(), this.perFeature ? (e.lineWidth = this.dashWidth.get(r, n), e.strokeStyle = this.dashColor.get(r, n), e.setLineDash(this.dash.get(r, n))) : e.setLineDash(this.dash.get(r)), e.stroke(), e.restore()) : (e.save(), this.perFeature && (e.lineWidth = this.width.get(r, n), e.strokeStyle = this.color.get(r, n)), e.stroke(), e.restore());
		}, "strokePath");
		e.beginPath();
		for (let o of t) for (let l = 0; l < o.length; l++) {
			let a = o[l];
			l === 0 ? e.moveTo(a.x, a.y) : e.lineTo(a.x, a.y);
		}
		i();
	}
};
u(Se, "LineSymbolizer");
var R = Se, Ae = class Ae {
	constructor(e) {
		this.name = e.name, this.sheet = e.sheet, this.dpr = window.devicePixelRatio;
	}
	place(e, t, r) {
		t[0];
		let i = new Point(t[0][0].x, t[0][0].y), o = this.sheet.get(this.name), l = o.w / this.dpr, a = o.h / this.dpr;
		return [{
			anchor: i,
			bboxes: [{
				minX: i.x - l / 2,
				minY: i.y - a / 2,
				maxX: i.x + l / 2,
				maxY: i.y + a / 2
			}],
			draw: u((d) => {
				d.globalAlpha = 1, d.drawImage(this.sheet.canvas, o.x, o.y, o.w, o.h, -o.w / 2 / this.dpr, -o.h / 2 / this.dpr, o.w / 2, o.h / 2);
			}, "draw")
		}];
	}
};
u(Ae, "IconSymbolizer");
var nt = Ae, De = class De {
	constructor(e) {
		this.radius = new v(e.radius, 3), this.fill = new M(e.fill, "black"), this.stroke = new M(e.stroke, "white"), this.width = new v(e.width, 0), this.opacity = new v(e.opacity);
	}
	draw(e, t, r, n) {
		e.globalAlpha = this.opacity.get(r, n);
		let i = this.radius.get(r, n), o = this.width.get(r, n);
		o > 0 && (e.strokeStyle = this.stroke.get(r, n), e.lineWidth = o, e.beginPath(), e.arc(t[0][0].x, t[0][0].y, i + o / 2, 0, 2 * Math.PI), e.stroke()), e.fillStyle = this.fill.get(r, n), e.beginPath(), e.arc(t[0][0].x, t[0][0].y, i, 0, 2 * Math.PI), e.fill();
	}
	place(e, t, r) {
		t[0];
		let i = new Point(t[0][0].x, t[0][0].y), o = this.radius.get(e.zoom, r);
		return [{
			anchor: i,
			bboxes: [{
				minX: i.x - o,
				minY: i.y - o,
				maxX: i.x + o,
				maxY: i.y + o
			}],
			draw: u((c) => {
				this.draw(c, [[new Point(0, 0)]], e.zoom, r);
			}, "draw")
		}];
	}
};
u(De, "CircleSymbolizer");
var te = De, Oe = class Oe {
	constructor(e) {
		this.font = new E(e), this.text = new N(e), this.fill = new M(e.fill, "black"), this.background = new M(e.background, "white"), this.padding = new v(e.padding, 0);
	}
	place(e, t, r) {
		let n = this.text.get(e.zoom, r);
		if (!n) return;
		let i = this.font.get(e.zoom, r);
		e.scratch.font = i;
		let o = e.scratch.measureText(n), l = o.width, a = o.actualBoundingBoxAscent, c = o.actualBoundingBoxDescent;
		t[0];
		let d = new Point(t[0][0].x, t[0][0].y), f = this.padding.get(e.zoom, r);
		return [{
			anchor: d,
			bboxes: [{
				minX: d.x - l / 2 - f,
				minY: d.y - a - f,
				maxX: d.x + l / 2 + f,
				maxY: d.y + c + f
			}],
			draw: u((g) => {
				g.globalAlpha = 1, g.fillStyle = this.background.get(e.zoom, r), g.fillRect(-l / 2 - f, -a - f, l + 2 * f, a + c + 2 * f), g.fillStyle = this.fill.get(e.zoom, r), g.font = i, g.fillText(n, -l / 2, 0);
			}, "draw")
		}];
	}
};
u(Oe, "ShieldSymbolizer");
var it = Oe, Me = class Me {
	constructor(e) {
		this.list = e;
	}
	place(e, t, r) {
		let n = this.list[0].place(e, t, r);
		if (!n) return;
		let i = n[0], o = i.anchor, l = i.bboxes[0], a = l.maxY - l.minY, c = [{
			draw: i.draw,
			translate: {
				x: 0,
				y: 0
			}
		}], m = [[new Point(t[0][0].x, t[0][0].y + a)]];
		for (let f = 1; f < this.list.length; f++) n = this.list[f].place(e, m, r), n && (i = n[0], l = at(l, i.bboxes[0]), c.push({
			draw: i.draw,
			translate: {
				x: 0,
				y: a
			}
		}));
		return [{
			anchor: o,
			bboxes: [l],
			draw: u((f) => {
				for (let b of c) f.save(), f.translate(b.translate.x, b.translate.y), b.draw(f), f.restore();
			}, "draw")
		}];
	}
};
u(Me, "FlexSymbolizer");
var st = Me, at = u((s, e) => ({
	minX: Math.min(s.minX, e.minX),
	minY: Math.min(s.minY, e.minY),
	maxX: Math.max(s.maxX, e.maxX),
	maxY: Math.max(s.maxY, e.maxY)
}), "mergeBbox"), Re = class Re {
	constructor(e) {
		this.list = e;
	}
	place(e, t, r) {
		let n = this.list[0];
		if (!n) return;
		let i = n.place(e, t, r);
		if (!i) return;
		let o = i[0], l = o.anchor, a = o.bboxes[0], c = [o.draw];
		for (let d = 1; d < this.list.length; d++) {
			if (i = this.list[d].place(e, t, r), !i) return;
			o = i[0], a = at(a, o.bboxes[0]), c.push(o.draw);
		}
		return [{
			anchor: l,
			bboxes: [a],
			draw: u((d) => {
				for (let f of c) f(d);
			}, "draw")
		}];
	}
};
u(Re, "GroupSymbolizer");
var re = Re, Fe = class Fe {
	constructor(e) {
		this.symbolizer = e;
	}
	place(e, t, r) {
		let n = t[0][0], i = this.symbolizer.place(e, [[new Point(0, 0)]], r);
		if (!i || i.length === 0) return;
		let o = i[0], l = o.bboxes[0], a = l.maxX - l.minX, c = l.maxY - l.minY;
		return [{
			anchor: n,
			bboxes: [{
				minX: n.x - a / 2,
				maxX: n.x + a / 2,
				minY: n.y - c / 2,
				maxY: n.y + c / 2
			}],
			draw: u((f) => {
				f.translate(-a / 2, c / 2 - l.maxY), o.draw(f, { justify: 2 });
			}, "draw")
		}];
	}
};
u(Fe, "CenteredSymbolizer");
var ve = Fe, Xe = class Xe {
	constructor(e, t) {
		this.padding = new v(e, 0), this.symbolizer = t;
	}
	place(e, t, r) {
		let n = this.symbolizer.place(e, t, r);
		if (!n || n.length === 0) return;
		let i = this.padding.get(e.zoom, r);
		for (let o of n) for (let l of o.bboxes) l.minX -= i, l.minY -= i, l.maxX += i, l.maxY += i;
		return n;
	}
};
u(Xe, "Padding");
var ot = Xe, Ye = class Ye {
	constructor(e) {
		this.font = new E(e), this.text = new N(e), this.fill = new M(e.fill, "black"), this.stroke = new M(e.stroke, "black"), this.width = new v(e.width, 0), this.lineHeight = new v(e.lineHeight, 1), this.letterSpacing = new v(e.letterSpacing, 0), this.maxLineCodeUnits = new v(e.maxLineChars, 15), this.justify = e.justify;
	}
	place(e, t, r) {
		let n = this.text.get(e.zoom, r);
		if (!n) return;
		let i = this.font.get(e.zoom, r);
		e.scratch.font = i;
		let o = this.letterSpacing.get(e.zoom, r), l = ge(n, this.maxLineCodeUnits.get(e.zoom, r)), a = "", c = 0;
		for (let p of l) p.length > c && (c = p.length, a = p);
		let m = e.scratch.measureText(a), d = m.width + o * (c - 1), f = m.actualBoundingBoxAscent, b = m.actualBoundingBoxDescent, x = (f + b) * this.lineHeight.get(e.zoom, r), g = new Point(t[0][0].x, t[0][0].y);
		return [{
			anchor: g,
			bboxes: [{
				minX: g.x,
				minY: g.y - f,
				maxX: g.x + d,
				maxY: g.y + b + (l.length - 1) * x
			}],
			draw: u((p, y) => {
				p.globalAlpha = 1, p.font = i, p.fillStyle = this.fill.get(e.zoom, r);
				let D = this.width.get(e.zoom, r), h = 0;
				for (let C of l) {
					let P = 0;
					if (this.justify === 2 || y && y.justify === 2 ? P = (d - p.measureText(C).width) / 2 : (this.justify === 3 || y && y.justify === 3) && (P = d - p.measureText(C).width), D) if (p.lineWidth = D * 2, p.strokeStyle = this.stroke.get(e.zoom, r), o > 0) {
						let z = P;
						for (let A of C) p.strokeText(A, z, h), z += p.measureText(A).width + o;
					} else p.strokeText(C, P, h);
					if (o > 0) {
						let z = P;
						for (let A of C) p.fillText(A, z, h), z += p.measureText(A).width + o;
					} else p.fillText(C, P, h);
					h += x;
				}
			}, "draw")
		}];
	}
};
u(Ye, "TextSymbolizer");
var ne = Ye, Ie = class Ie {
	constructor(e) {
		this.centered = new ve(new ne(e));
	}
	place(e, t, r) {
		return this.centered.place(e, t, r);
	}
};
u(Ie, "CenteredTextSymbolizer");
var j = Ie, Be = class Be {
	constructor(e, t) {
		var r, n, i;
		this.symbolizer = e, this.offsetX = new v(t.offsetX, 0), this.offsetY = new v(t.offsetY, 0), this.justify = (r = t.justify) != null ? r : void 0, this.placements = (n = t.placements) != null ? n : [
			2,
			6,
			8,
			4,
			1,
			3,
			5,
			7
		], this.ddValues = (i = t.ddValues) != null ? i : () => ({});
	}
	place(e, t, r) {
		if (r.geomType !== 1) return;
		let n = t[0][0], i = this.symbolizer.place(e, [[new Point(0, 0)]], r);
		if (!i || i.length === 0) return;
		let o = i[0], l = o.bboxes[0], a = this.offsetX, c = this.offsetY, m = this.justify, d = this.placements, { offsetX: f, offsetY: b, justify: x, placements: g } = this.ddValues(e.zoom, r) || {};
		f && (a = new v(f, 0)), b && (c = new v(b, 0)), x && (m = x), g && (d = g);
		let w = a.get(e.zoom, r), k = c.get(e.zoom, r), p = u((P, z) => ({
			minX: P.x + z.x + l.minX,
			minY: P.y + z.y + l.minY,
			maxX: P.x + z.x + l.maxX,
			maxY: P.y + z.y + l.maxY
		}), "getBbox"), y = new Point(w, k), D, h = u((P) => {
			P.translate(y.x, y.y), o.draw(P, { justify: D });
		}, "draw"), C = u((P, z) => {
			let A = p(P, z);
			if (!e.index.bboxCollides(A, e.order)) return [{
				anchor: n,
				bboxes: [A],
				draw: h
			}];
		}, "placeLabelInPoint");
		for (let P of d) {
			let z = this.computeXaxisOffset(w, l, P), A = this.computeYaxisOffset(k, l, P);
			return D = this.computeJustify(m, P), y = new Point(z, A), C(n, y);
		}
	}
	computeXaxisOffset(e, t, r) {
		let n = t.maxX, i = n / 2;
		return [1, 5].includes(r) ? e - i : [
			8,
			7,
			6
		].includes(r) ? e - n : e;
	}
	computeYaxisOffset(e, t, r) {
		let n = Math.abs(t.minY), i = t.maxY, o = (t.minY + t.maxY) / 2;
		return [3, 7].includes(r) ? e - o : [
			8,
			2,
			1
		].includes(r) ? e - i : [
			6,
			4,
			5
		].includes(r) ? e + n : e;
	}
	computeJustify(e, t) {
		return e || ([1, 5].includes(t) ? 2 : [
			2,
			3,
			4
		].includes(t) ? 1 : 3);
	}
};
u(Be, "OffsetSymbolizer");
var Le = Be, je = class je {
	constructor(e) {
		this.symbolizer = new Le(new ne(e), e);
	}
	place(e, t, r) {
		return this.symbolizer.place(e, t, r);
	}
};
u(je, "OffsetTextSymbolizer");
var ie = je, Rt = ((r) => (r[r.Above = 1] = "Above", r[r.Center = 2] = "Center", r[r.Below = 3] = "Below", r))(Rt || {}), _e = class _e {
	constructor(e) {
		var t;
		this.font = new E(e), this.text = new N(e), this.fill = new M(e.fill, "black"), this.stroke = new M(e.stroke, "black"), this.width = new v(e.width, 0), this.offset = new v(e.offset, 0), this.position = (t = e.position) != null ? t : 1, this.maxLabelCodeUnits = new v(e.maxLabelChars, 40), this.repeatDistance = new v(e.repeatDistance, 250);
	}
	place(e, t, r) {
		let n = this.text.get(e.zoom, r);
		if (!n || n.length > this.maxLabelCodeUnits.get(e.zoom, r)) return;
		let i = 20, o = r.bbox;
		if (o.maxY - o.minY < i && o.maxX - o.minX < i) return;
		let l = this.font.get(e.zoom, r);
		e.scratch.font = l;
		let a = e.scratch.measureText(n), c = a.width, m = a.actualBoundingBoxAscent + a.actualBoundingBoxDescent, d = this.repeatDistance.get(e.zoom, r);
		e.overzoom > 4 && (d *= 1 << e.overzoom - 4);
		let f = m * 2, b = Ue(t, c, d, f);
		if (b.length === 0) return;
		let x = [];
		for (let g of b) {
			let w = g.end.x - g.start.x, k = g.end.y - g.start.y, y = Ge(g.start, g.end, c, f / 2).map((h) => ({
				minX: h.x - f / 2,
				minY: h.y - f / 2,
				maxX: h.x + f / 2,
				maxY: h.y + f / 2
			})), D = u((h) => {
				h.globalAlpha = 1, h.rotate(Math.atan2(k, w)), w < 0 && (h.scale(-1, -1), h.translate(-c, 0));
				let C = 0;
				this.position === 3 ? C += m : this.position === 2 && (C += m / 2), h.translate(0, C - this.offset.get(e.zoom, r)), h.font = l;
				let P = this.width.get(e.zoom, r);
				P && (h.lineWidth = P, h.strokeStyle = this.stroke.get(e.zoom, r), h.strokeText(n, 0, 0)), h.fillStyle = this.fill.get(e.zoom, r), h.fillText(n, 0, 0);
			}, "draw");
			x.push({
				anchor: g.start,
				bboxes: y,
				draw: D,
				deduplicationKey: n,
				deduplicationDistance: d
			});
		}
		return x;
	}
};
u(_e, "LineLabelSymbolizer");
var $ = _e;
var F = u((s, e) => {
	let t = s[e];
	return typeof t == "string" ? t : "";
}, "getString"), lt = u((s, e) => {
	let t = s[e];
	return typeof t == "number" ? t : 0;
}, "getNumber"), se = u((s) => [
	{
		dataLayer: "earth",
		symbolizer: new T({ fill: s.earth })
	},
	...s.landcover ? [{
		dataLayer: "landcover",
		symbolizer: new T({
			fill: u((e, t) => {
				let r = s.landcover;
				if (!r || !t) return "";
				let n = F(t.props, "kind");
				return n === "grassland" ? r.grassland : n === "barren" ? r.barren : n === "urban_area" ? r.urban_area : n === "farmland" ? r.farmland : n === "glacier" ? r.glacier : n === "scrub" ? r.scrub : r.forest;
			}, "fill"),
			opacity: u((e, t) => e === 8 ? .5 : 1, "opacity")
		})
	}] : [],
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: u((e, t) => mix(s.park_a, s.park_b, Math.min(Math.max(e / 12, 12), 0)), "fill") }),
		filter: u((e, t) => {
			let r = F(t.props, "kind");
			return [
				"allotments",
				"village_green",
				"playground"
			].includes(r);
		}, "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({
			fill: s.park_b,
			opacity: u((e, t) => e < 8 ? 0 : e === 8 ? .5 : 1, "opacity")
		}),
		filter: u((e, t) => {
			let r = F(t.props, "kind");
			return [
				"national_park",
				"park",
				"cemetery",
				"protected_area",
				"nature_reserve",
				"forest",
				"golf_course"
			].includes(r);
		}, "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.hospital }),
		filter: u((e, t) => t.props.kind === "hospital", "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.industrial }),
		filter: u((e, t) => t.props.kind === "industrial", "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.school }),
		filter: u((e, t) => {
			let r = F(t.props, "kind");
			return [
				"school",
				"university",
				"college"
			].includes(r);
		}, "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.beach }),
		filter: u((e, t) => t.props.kind === "beach", "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.zoo }),
		filter: u((e, t) => t.props.kind === "zoo", "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.zoo }),
		filter: u((e, t) => {
			let r = F(t.props, "kind");
			return [
				"military",
				"naval_base",
				"airfield"
			].includes(r);
		}, "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({
			fill: u((e, t) => mix(s.wood_a, s.wood_b, Math.min(Math.max(e / 12, 12), 0)), "fill"),
			opacity: u((e, t) => e < 8 ? 0 : e === 8 ? .5 : 1, "opacity")
		}),
		filter: u((e, t) => {
			let r = F(t.props, "kind");
			return [
				"wood",
				"nature_reserve",
				"forest"
			].includes(r);
		}, "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: u((e, t) => mix(s.scrub_a, s.scrub_b, Math.min(Math.max(e / 12, 12), 0)), "fill") }),
		filter: u((e, t) => {
			let r = F(t.props, "kind");
			return [
				"scrub",
				"grassland",
				"grass"
			].includes(r);
		}, "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.scrub_b }),
		filter: u((e, t) => {
			let r = F(t.props, "kind");
			return [
				"scrub",
				"grassland",
				"grass"
			].includes(r);
		}, "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.glacier }),
		filter: u((e, t) => t.props.kind === "glacier", "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({
			fill: s.sand,
			opacity: u((e, t) => e < 8 ? 0 : e === 8 ? .5 : 1, "opacity")
		}),
		filter: u((e, t) => t.props.kind === "sand", "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.aerodrome }),
		filter: u((e, t) => t.props.kind === "aerodrome", "filter")
	},
	{
		dataLayer: "water",
		symbolizer: new T({ fill: s.water }),
		filter: u((e, t) => t.geomType === 3, "filter")
	},
	{
		dataLayer: "roads",
		symbolizer: new R({
			color: s.runway,
			width: u((e, t) => Y(1.6, [
				[11, 0],
				[13, 4],
				[19, 30]
			])(e), "width")
		}),
		filter: u((e, t) => t.props.kind_detail === "runway", "filter")
	},
	{
		dataLayer: "roads",
		symbolizer: new R({
			color: s.runway,
			width: u((e, t) => Y(1.6, [
				[14, 0],
				[14.5, 1],
				[16, 6]
			])(e), "width")
		}),
		filter: u((e, t) => t.props.kind_detail === "taxiway", "filter")
	},
	{
		dataLayer: "roads",
		symbolizer: new R({
			color: s.pier,
			width: u((e, t) => Y(1.6, [
				[13, 0],
				[
					13.5,
					0,
					5
				],
				[21, 16]
			])(e), "width")
		}),
		filter: u((e, t) => t.props.kind === "path" && t.props.kind_detail === "pier", "filter")
	},
	{
		dataLayer: "water",
		minzoom: 14,
		symbolizer: new R({
			color: s.water,
			width: u((e, t) => Y(1.6, [
				[9, 0],
				[9.5, 1],
				[18, 12]
			])(e), "width")
		}),
		filter: u((e, t) => t.geomType === 2 && t.props.kind === "river", "filter")
	},
	{
		dataLayer: "water",
		minzoom: 14,
		symbolizer: new R({
			color: s.water,
			width: .5
		}),
		filter: u((e, t) => t.geomType === 2 && t.props.kind === "stream", "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.pedestrian }),
		filter: u((e, t) => t.props.kind === "pedestrian", "filter")
	},
	{
		dataLayer: "landuse",
		symbolizer: new T({ fill: s.pier }),
		filter: u((e, t) => t.props.kind === "pier", "filter")
	},
	{
		dataLayer: "buildings",
		symbolizer: new T({
			fill: s.buildings,
			opacity: .5
		})
	},
	{
		dataLayer: "roads",
		symbolizer: new R({
			color: s.major,
			width: u((e, t) => Y(1.6, [[14, 0], [20, 7]])(e), "width")
		}),
		filter: u((e, t) => {
			let r = F(t.props, "kind");
			return ["other", "path"].includes(r);
		}, "filter")
	},
	{
		dataLayer: "roads",
		symbolizer: new R({
			color: s.major,
			width: u((e, t) => Y(1.6, [[13, 0], [18, 8]])(e), "width")
		}),
		filter: u((e, t) => t.props.kind === "minor_road", "filter")
	},
	{
		dataLayer: "roads",
		symbolizer: new R({
			color: s.major,
			width: u((e, t) => Y(1.6, [
				[6, 0],
				[12, 1.6],
				[15, 3],
				[18, 13]
			])(e), "width")
		}),
		filter: u((e, t) => t.props.kind === "major_road", "filter")
	},
	{
		dataLayer: "roads",
		symbolizer: new R({
			color: s.major,
			width: u((e, t) => Y(1.6, [
				[3, 0],
				[6, 1.1],
				[12, 1.6],
				[15, 5],
				[18, 15]
			])(e), "width")
		}),
		filter: u((e, t) => t.props.kind === "highway", "filter")
	},
	{
		dataLayer: "boundaries",
		symbolizer: new R({
			color: s.boundaries,
			width: 1
		}),
		filter: u((e, t) => {
			let r = t.props.kind_detail;
			return typeof r == "number" && r <= 2;
		}, "filter")
	},
	{
		dataLayer: "roads",
		symbolizer: new R({
			dash: [.3, .75],
			color: s.railway,
			dashWidth: u((e, t) => Y(1.6, [
				[4, 0],
				[7, .15],
				[19, 9]
			])(e), "dashWidth"),
			opacity: .5
		}),
		filter: u((e, t) => t.props.kind === "rail", "filter")
	},
	{
		dataLayer: "boundaries",
		symbolizer: new R({
			color: s.boundaries,
			width: .5
		}),
		filter: u((e, t) => {
			let r = t.props.kind_detail;
			return typeof r == "number" && r > 2;
		}, "filter")
	}
], "paintRules"), oe = u((s, e) => {
	let t = [`name:${e}`, "name"];
	return [
		{
			dataLayer: "roads",
			symbolizer: new $({
				labelProps: t,
				fill: s.roads_label_minor,
				font: "400 12px sans-serif",
				width: 2,
				stroke: s.roads_label_minor_halo
			}),
			minzoom: 16,
			filter: u((r, n) => {
				let i = F(n.props, "kind");
				return [
					"minor_road",
					"other",
					"path"
				].includes(i);
			}, "filter")
		},
		{
			dataLayer: "roads",
			symbolizer: new $({
				labelProps: t,
				fill: s.roads_label_major,
				font: "400 12px sans-serif",
				width: 2,
				stroke: s.roads_label_major_halo
			}),
			minzoom: 12,
			filter: u((r, n) => {
				let i = F(n.props, "kind");
				return ["highway", "major_road"].includes(i);
			}, "filter")
		},
		{
			dataLayer: "roads",
			symbolizer: new $({
				labelProps: t,
				fill: s.roads_label_major,
				font: "400 12px sans-serif",
				width: 2,
				stroke: s.roads_label_major_halo
			}),
			minzoom: 12,
			filter: u((r, n) => {
				let i = F(n.props, "kind");
				return ["highway", "major_road"].includes(i);
			}, "filter")
		},
		{
			dataLayer: "water",
			symbolizer: new j({
				labelProps: t,
				fill: s.ocean_label,
				lineHeight: 1.5,
				letterSpacing: 1,
				font: u((r, n) => `400 ${Te([[3, 10], [10, 12]])(r)}px sans-serif`, "font"),
				textTransform: "uppercase"
			}),
			filter: u((r, n) => {
				let i = F(n.props, "kind");
				return n.geomType === 1 && [
					"ocean",
					"bay",
					"strait",
					"fjord"
				].includes(i);
			}, "filter")
		},
		{
			dataLayer: "water",
			symbolizer: new j({
				labelProps: t,
				fill: s.ocean_label,
				lineHeight: 1.5,
				letterSpacing: 1,
				font: u((r, n) => `400 ${Te([
					[3, 10],
					[6, 12],
					[10, 12]
				])(r)}px sans-serif`, "font")
			}),
			filter: u((r, n) => {
				let i = F(n.props, "kind");
				return n.geomType === 1 && [
					"sea",
					"lake",
					"water"
				].includes(i);
			}, "filter")
		},
		{
			dataLayer: "places",
			symbolizer: new j({
				labelProps: u((r, n) => r < 6 ? [`ref:${e}`, "ref"] : t, "labelProps"),
				fill: s.state_label,
				stroke: s.state_label_halo,
				width: 1,
				lineHeight: 1.5,
				font: u((r, n) => "400 12px sans-serif", "font"),
				textTransform: "uppercase"
			}),
			filter: u((r, n) => n.props.kind === "region", "filter")
		},
		{
			dataLayer: "places",
			symbolizer: new j({
				labelProps: t,
				fill: s.country_label,
				lineHeight: 1.5,
				font: u((r, n) => "600 12px sans-serif", "font"),
				textTransform: "uppercase"
			}),
			filter: u((r, n) => n.props.kind === "country", "filter")
		},
		{
			dataLayer: "places",
			minzoom: 9,
			symbolizer: new j({
				labelProps: t,
				fill: s.city_label,
				lineHeight: 1.5,
				font: u((r, n) => {
					if (!n) return "400 12px sans-serif";
					let i = n.props.min_zoom, o = 400;
					i && i <= 5 && (o = 600);
					let l = 12, a = n.props.population_rank;
					return a && a > 9 && (l = 16), `${o} ${l}px sans-serif`;
				}, "font")
			}),
			sort: u((r, n) => {
				return lt(r, "min_zoom") - lt(n, "min_zoom");
			}, "sort"),
			filter: u((r, n) => n.props.kind === "locality", "filter")
		},
		{
			dataLayer: "places",
			maxzoom: 8,
			symbolizer: new re([new te({
				radius: 2,
				fill: s.city_label,
				stroke: s.city_label_halo,
				width: 1.5
			}), new ie({
				labelProps: t,
				fill: s.city_label,
				stroke: s.city_label_halo,
				width: 1,
				offsetX: 6,
				offsetY: 4.5,
				font: u((r, n) => "400 12px sans-serif", "font")
			})]),
			filter: u((r, n) => n.props.kind === "locality", "filter")
		}
	];
}, "labelRules");
var le = u((s, e, t) => {
	let r = [];
	for (let n of s) {
		let i = [];
		for (let o of n) i.push(o.clone().mult(e).add(t));
		r.push(i);
	}
	return r;
}, "transformGeom"), ae = u((s, e) => {
	let t = 1 << e;
	return s < 0 ? t + s : s >= t ? s % t : s;
}, "wrap"), $e = class $e {
	constructor(e, t, r) {
		this.tileCache = e, this.maxDataLevel = t, this.levelDiff = r;
	}
	dataTilesForBounds(e, t) {
		let r = S(2, e) / S(2, Math.ceil(e)), n = [], i = 1, o = this.tileCache.tileSize;
		if (e < this.levelDiff) i = 1 / (1 << this.levelDiff - e) * r, n.push({
			dataTile: {
				z: 0,
				x: 0,
				y: 0
			},
			origin: new Point(0, 0),
			scale: i,
			dim: o * i
		});
		else if (e <= this.levelDiff + this.maxDataLevel) {
			let l = 1 << this.levelDiff, a = 256 * r, c = Math.ceil(e) - this.levelDiff, m = Math.floor(t.minX / l / a), d = Math.floor(t.minY / l / a), f = Math.floor(t.maxX / l / a), b = Math.floor(t.maxY / l / a);
			for (let x = m; x <= f; x++) for (let g = d; g <= b; g++) {
				let w = new Point(x * l * a, g * l * a);
				n.push({
					dataTile: {
						z: c,
						x: ae(x, c),
						y: ae(g, c)
					},
					origin: w,
					scale: r,
					dim: o * r
				});
			}
		} else {
			let l = 1 << this.levelDiff;
			i = (1 << Math.ceil(e) - this.maxDataLevel - this.levelDiff) * r;
			let a = Math.floor(t.minX / l / 256 / i), c = Math.floor(t.minY / l / 256 / i), m = Math.floor(t.maxX / l / 256 / i), d = Math.floor(t.maxY / l / 256 / i);
			for (let f = a; f <= m; f++) for (let b = c; b <= d; b++) {
				let x = new Point(f * l * 256 * i, b * l * 256 * i);
				n.push({
					dataTile: {
						z: this.maxDataLevel,
						x: ae(f, this.maxDataLevel),
						y: ae(b, this.maxDataLevel)
					},
					origin: x,
					scale: i,
					dim: o * i
				});
			}
		}
		return n;
	}
	dataTileForDisplayTile(e) {
		let t, r = 1, n = this.tileCache.tileSize, i;
		if (e.z < this.levelDiff) t = {
			z: 0,
			x: 0,
			y: 0
		}, r = 1 / (1 << this.levelDiff - e.z), i = new Point(0, 0), n = n * r;
		else if (e.z <= this.levelDiff + this.maxDataLevel) {
			let o = 1 << this.levelDiff;
			t = {
				z: e.z - this.levelDiff,
				x: Math.floor(e.x / o),
				y: Math.floor(e.y / o)
			}, i = new Point(t.x * o * 256, t.y * o * 256);
		} else {
			r = 1 << e.z - this.maxDataLevel - this.levelDiff;
			let o = 1 << this.levelDiff;
			t = {
				z: this.maxDataLevel,
				x: Math.floor(e.x / o / r),
				y: Math.floor(e.y / o / r)
			}, i = new Point(t.x * o * r * 256, t.y * o * r * 256), n = n * r;
		}
		return {
			dataTile: t,
			scale: r,
			origin: i,
			dim: n
		};
	}
	getBbox(e, t) {
		return O(this, null, function* () {
			let r = this.dataTilesForBounds(e, t);
			return (yield Promise.all(r.map((i) => this.tileCache.get(i.dataTile)))).map((i, o) => {
				let l = r[o];
				return {
					data: i,
					z: e,
					dataTile: l.dataTile,
					scale: l.scale,
					dim: l.dim,
					origin: l.origin
				};
			});
		});
	}
	getDisplayTile(e) {
		return O(this, null, function* () {
			let t = this.dataTileForDisplayTile(e);
			return {
				data: yield this.tileCache.get(t.dataTile),
				z: e.z,
				dataTile: t.dataTile,
				scale: t.scale,
				origin: t.origin,
				dim: t.dim
			};
		});
	}
	queryFeatures(e, t, r, n) {
		let i = Math.round(r), o = Math.min(i - this.levelDiff, this.maxDataLevel), l = n / (1 << i - o);
		return this.tileCache.queryFeatures(e, t, o, l);
	}
};
u($e, "View");
var Ee = $e, ue = u((s) => {
	let e = u((r) => {
		let n = r.levelDiff === void 0 ? 1 : r.levelDiff, i = r.maxDataZoom || 15, o;
		if (typeof r.url == "string") new URL(r.url, "http://example.com").pathname.endsWith(".pmtiles") ? o = new H(r.url, !0) : o = new Q(r.url, !0);
		else if (r.url) o = new H(r.url, !0);
		else throw new Error(`Invalid source ${r.url}`);
		return new Ee(new ee(o, 256 * 1 << n), i, n);
	}, "sourceToViews"), t = /* @__PURE__ */ new Map();
	if (s.sources) for (let r in s.sources) t.set(r, e(s.sources[r]));
	else t.set("", e(s));
	return t;
}, "sourcesToViews");
var Yt = u((s, e, t) => {
	let n = e / 256, i = Math.floor(t.minX / 256), o = Math.floor(t.minY / 256), l = Math.floor(t.maxX / 256), a = Math.floor(t.maxY / 256), c = Math.log2(n), m = [];
	for (let d = i; d <= l; d++) {
		let f = d % (1 << s);
		for (let b = o; b <= a; b++) m.push({
			display: B({
				z: s,
				x: f,
				y: b
			}),
			key: B({
				z: s - c,
				x: Math.floor(f / n),
				y: Math.floor(b / n)
			})
		});
	}
	return m;
}, "covering"), We = class We {
	constructor(e, t) {
		this.tree = new RBush(), this.current = /* @__PURE__ */ new Map(), this.dim = e, this.maxLabeledTiles = t;
	}
	hasPrefix(e) {
		for (let t of this.current.keys()) if (t.startsWith(e)) return !0;
		return !1;
	}
	has(e) {
		return this.current.has(e);
	}
	size() {
		return this.current.size;
	}
	keys() {
		return this.current.keys();
	}
	searchBbox(e, t) {
		let r = /* @__PURE__ */ new Set();
		for (let n of this.tree.search(e)) n.indexedLabel.order <= t && r.add(n.indexedLabel);
		return r;
	}
	searchLabel(e, t) {
		let r = /* @__PURE__ */ new Set();
		for (let n of e.bboxes) for (let i of this.tree.search(n)) i.indexedLabel.order <= t && r.add(i.indexedLabel);
		return r;
	}
	bboxCollides(e, t) {
		for (let r of this.tree.search(e)) if (r.indexedLabel.order <= t) return !0;
		return !1;
	}
	labelCollides(e, t) {
		for (let r of e.bboxes) for (let n of this.tree.search(r)) if (n.indexedLabel.order <= t) return !0;
		return !1;
	}
	deduplicationCollides(e) {
		if (!e.deduplicationKey || !e.deduplicationDistance) return !1;
		let t = e.deduplicationDistance, r = {
			minX: e.anchor.x - t,
			minY: e.anchor.y - t,
			maxX: e.anchor.x + t,
			maxY: e.anchor.y + t
		};
		for (let n of this.tree.search(r)) if (n.indexedLabel.deduplicationKey === e.deduplicationKey && n.indexedLabel.anchor.dist(e.anchor) < t) return !0;
		return !1;
	}
	makeEntry(e) {
		this.current.get(e) && console.log("consistency error 1");
		let t = /* @__PURE__ */ new Set();
		this.current.set(e, t);
	}
	insert(e, t, r) {
		let n = {
			anchor: e.anchor,
			bboxes: e.bboxes,
			draw: e.draw,
			order: t,
			tileKey: r,
			deduplicationKey: e.deduplicationKey,
			deduplicationDistance: e.deduplicationDistance
		}, i = this.current.get(r);
		if (!i) {
			let a = /* @__PURE__ */ new Set();
			this.current.set(r, a), i = a;
		}
		i.add(n);
		let o = !1, l = !1;
		for (let a of e.bboxes) this.tree.insert({
			minX: a.minX,
			minY: a.minY,
			maxX: a.maxX,
			maxY: a.maxY,
			indexedLabel: n
		}), a.minX < 0 && (o = !0), a.maxX > this.dim && (l = !0);
		if (o || l) {
			let a = o ? this.dim : -this.dim, c = [];
			for (let f of e.bboxes) c.push({
				minX: f.minX + a,
				minY: f.minY,
				maxX: f.maxX + a,
				maxY: f.maxY
			});
			let m = {
				anchor: new Point(e.anchor.x + a, e.anchor.y),
				bboxes: c,
				draw: e.draw,
				order: t,
				tileKey: r
			}, d = this.current.get(r);
			d && d.add(m);
			for (let f of c) this.tree.insert({
				minX: f.minX,
				minY: f.minY,
				maxX: f.maxX,
				maxY: f.maxY,
				indexedLabel: m
			});
		}
	}
	pruneOrNoop(e) {
		let t = e.split(":"), r, n = 0, i = 0;
		for (let o of this.current.keys()) {
			let l = o.split(":");
			if (l[3] === t[3]) {
				i++;
				let a = Math.sqrt(S(+l[0] - +t[0], 2) + S(+l[1] - +t[1], 2));
				a > n && (n = a, r = o);
			}
			r && i > this.maxLabeledTiles && this.pruneKey(r);
		}
	}
	pruneKey(e) {
		let t = this.current.get(e);
		if (!t) return;
		let r = [];
		for (let n of this.tree.all()) t.has(n.indexedLabel) && r.push(n);
		for (let n of r) this.tree.remove(n);
		this.current.delete(e);
	}
	removeLabel(e) {
		let t = [];
		for (let n of this.tree.all()) e === n.indexedLabel && t.push(n);
		for (let n of t) this.tree.remove(n);
		let r = this.current.get(e.tileKey);
		r && r.delete(e);
	}
};
u(We, "Index");
var Je = We, He = class He {
	constructor(e, t, r, n, i) {
		this.index = new Je(256 * 1 << e, n), this.z = e, this.scratch = t, this.labelRules = r, this.callback = i;
	}
	layout(e) {
		let t = performance.now(), r = /* @__PURE__ */ new Set();
		for (let [i, o] of e) for (let l of o) {
			let a = `${B(l.dataTile)}:${i}`;
			this.index.has(a) || (this.index.makeEntry(a), r.add(a));
		}
		let n = /* @__PURE__ */ new Set();
		for (let [i, o] of this.labelRules.entries()) {
			if (o.visible === !1 || o.minzoom && this.z < o.minzoom || o.maxzoom && this.z > o.maxzoom) continue;
			let l = o.dataSource || "", a = e.get(l);
			if (a) for (let c of a) {
				let m = `${B(c.dataTile)}:${l}`;
				if (!r.has(m)) continue;
				let d = c.data.get(o.dataLayer);
				if (d === void 0) continue;
				let f = d;
				o.sort && f.sort((x, g) => o.sort ? o.sort(x.props, g.props) : 0);
				let b = {
					index: this.index,
					zoom: this.z,
					scratch: this.scratch,
					order: i,
					overzoom: this.z - c.dataTile.z
				};
				for (let x of f) {
					if (o.filter && !o.filter(this.z, x)) continue;
					let g = le(x.geom, c.scale, c.origin), w = o.symbolizer.place(b, g, x);
					if (w) for (let k of w) {
						let p = !1;
						if (!(k.deduplicationKey && this.index.deduplicationCollides(k))) {
							if (this.index.labelCollides(k, Infinity)) {
								if (!this.index.labelCollides(k, i)) {
									let y = this.index.searchLabel(k, Infinity);
									for (let D of y) {
										this.index.removeLabel(D);
										for (let h of D.bboxes) this.findInvalidatedTiles(n, c.dim, h, m);
									}
									this.index.insert(k, i, m), p = !0;
								}
							} else this.index.insert(k, i, m), p = !0;
							if (p) for (let y of k.bboxes) (y.maxX > c.origin.x + c.dim || y.minX < c.origin.x || y.minY < c.origin.y || y.maxY > c.origin.y + c.dim) && this.findInvalidatedTiles(n, c.dim, y, m);
						}
					}
				}
			}
		}
		for (let i of r) this.index.pruneOrNoop(i);
		return n.size > 0 && this.callback && this.callback(n), performance.now() - t;
	}
	findInvalidatedTiles(e, t, r, n) {
		let i = Yt(this.z, t, r);
		for (let o of i) o.key !== n && this.index.hasPrefix(o.key) && e.add(o.display);
	}
	add(e) {
		let t = !0;
		for (let [n, i] of e) for (let o of i) this.index.has(`${B(o.dataTile)}:${n}`) || (t = !1);
		return t ? 0 : this.layout(e);
	}
};
u(He, "Labeler");
var V = He, Ve = class Ve {
	constructor(e, t, r, n) {
		this.labelers = /* @__PURE__ */ new Map(), this.scratch = e, this.labelRules = t, this.maxLabeledTiles = r, this.callback = n;
	}
	add(e, t) {
		let r = this.labelers.get(e);
		return r || (r = new V(e, this.scratch, this.labelRules, this.maxLabeledTiles, this.callback), this.labelers.set(e, r)), r.add(t);
	}
	getIndex(e) {
		let t = this.labelers.get(e);
		if (t) return t.index;
	}
};
u(Ve, "Labelers");
var Z = Ve;
function ce(s, e, t, r, n, i, o, l, a) {
	let c = performance.now();
	s.save(), s.miterLimit = 2;
	for (let m of n) {
		if (m.minzoom && e < m.minzoom || m.maxzoom && e > m.maxzoom) continue;
		let d = t.get(m.dataSource || "");
		if (d) for (let f of d) {
			let b = f.data.get(m.dataLayer);
			if (b === void 0) continue;
			m.symbolizer.before && m.symbolizer.before(s, f.z);
			let x = f.origin, g = f.dim, w = f.scale;
			if (s.save(), l) {
				s.beginPath();
				let k = Math.max(x.x - o.x, i.minX - o.x), p = Math.max(x.y - o.y, i.minY - o.y), y = Math.min(x.x - o.x + g, i.maxX - o.x), D = Math.min(x.y - o.y + g, i.maxY - o.y);
				s.rect(k, p, y - k, D - p), s.clip();
			}
			s.translate(x.x - o.x, x.y - o.y);
			for (let k of b) {
				let p = k.geom, y = k.bbox;
				y.maxX * w + x.x < i.minX || y.minX * w + x.x > i.maxX || y.minY * w + x.y > i.maxY || y.maxY * w + x.y < i.minY || m.filter && !m.filter(f.z, k) || (w !== 1 && (p = le(p, w, new Point(0, 0))), m.symbolizer.draw(s, p, f.z, k));
			}
			s.restore();
		}
	}
	if (l && (s.beginPath(), s.rect(i.minX - o.x, i.minY - o.y, i.maxX - i.minX, i.maxY - i.minY), s.clip()), r) {
		let m = r.searchBbox(i, Infinity);
		for (let d of m) if (s.save(), s.translate(d.anchor.x - o.x, d.anchor.y - o.y), d.draw(s), s.restore(), a) {
			s.lineWidth = .5, s.strokeStyle = a, s.fillStyle = a, s.globalAlpha = 1, s.fillRect(d.anchor.x - o.x - 2, d.anchor.y - o.y - 2, 4, 4);
			for (let f of d.bboxes) s.strokeRect(f.minX - o.x, f.minY - o.y, f.maxX - f.minX, f.maxY - f.minY);
		}
	}
	return s.restore(), performance.now() - c;
}
u(ce, "paint");
var q = 6378137, ut = 85.0511287798, X = q * Math.PI, ft = u((s) => {
	let e = Math.PI / 180, t = Math.max(Math.min(ut, s.y), -ut), r = Math.sin(t * e);
	return new Point(q * s.x * e, q * Math.log((1 + r) / (1 - r)) / 2);
}, "project"), jt = u((s) => {
	let e = 180 / Math.PI;
	return {
		lat: (2 * Math.atan(Math.exp(s.y / q)) - Math.PI / 2) * e,
		lng: s.x * e / q
	};
}, "unproject"), _t = u((s, e) => (t) => {
	let r = ft(t);
	return new Point((r.x + X) / (X * 2), 1 - (r.y + X) / (X * 2)).mult(S(2, e) * 256).sub(s);
}, "instancedProject"), Nt = u((s, e) => (t) => {
	let r = new Point(t.x, t.y).add(s).div(S(2, e) * 256);
	return jt(new Point(r.x * (X * 2) - X, (1 - r.y) * (X * 2) - X));
}, "instancedUnproject"), ct = u((s, e) => {
	let t = e * (360 / s);
	return Math.log2(t / 256);
}, "getZoom"), Ze = class Ze {
	constructor(e) {
		if (e.flavor) {
			let t = C(e.flavor);
			this.paintRules = se(t), this.labelRules = oe(t, e.lang || "en"), this.backgroundColor = t.background;
		} else this.paintRules = e.paintRules || [], this.labelRules = e.labelRules || [], this.backgroundColor = e.backgroundColor;
		this.views = ue(e), this.debug = e.debug || "";
	}
	drawContext(e, t, r, n, i) {
		return O(this, null, function* () {
			let o = ft(n), a = new Point((o.x + X) / (X * 2), 1 - (o.y + X) / (X * 2)).clone().mult(S(2, i) * 256).sub(new Point(t / 2, r / 2)), c = {
				minX: a.x,
				minY: a.y,
				maxX: a.x + t,
				maxY: a.y + r
			}, m = [];
			for (let [p, y] of this.views) {
				let D = y.getBbox(i, c);
				m.push({
					key: p,
					promise: D
				});
			}
			let d = yield Promise.all(m.map((p) => p.promise.then((y) => ({
				status: "fulfilled",
				value: y,
				key: p.key
			}), (y) => ({
				status: "rejected",
				value: [],
				reason: y,
				key: p.key
			})))), f = /* @__PURE__ */ new Map();
			for (let p of d) p.status === "fulfilled" && f.set(p.key, p.value);
			let b = performance.now(), x = new V(i, e, this.labelRules, 16, void 0);
			x.add(f);
			this.backgroundColor && (e.save(), e.fillStyle = this.backgroundColor, e.fillRect(0, 0, t, r), e.restore());
			let w = this.paintRules;
			ce(e, i, f, x.index, w, c, a, !0, this.debug);
			if (this.debug) {
				e.save(), e.translate(-a.x, -a.y), e.strokeStyle = this.debug, e.fillStyle = this.debug, e.font = "12px sans-serif";
				let p = 0;
				for (let [y, D] of f) {
					for (let h of D) {
						e.strokeRect(h.origin.x, h.origin.y, h.dim, h.dim);
						let C = h.dataTile;
						e.fillText(`${y + (y ? " " : "") + C.z} ${C.x} ${C.y}`, h.origin.x + 4, h.origin.y + 14 * (1 + p));
					}
					p++;
				}
				e.restore();
			}
			return {
				elapsed: performance.now() - b,
				project: _t(a, i),
				unproject: Nt(a, i)
			};
		});
	}
	drawCanvas(i, o, l) {
		return O(this, arguments, function* (e, t, r, n = {}) {
			let a = window.devicePixelRatio, c = e.clientWidth, m = e.clientHeight;
			e.width === c * a && e.height === m * a || (e.width = c * a, e.height = m * a), n.lang && (e.lang = n.lang);
			let d = e.getContext("2d");
			if (!d) {
				console.error("Failed to initialize canvas2d context.");
				return;
			}
			return d.setTransform(a, 0, 0, a, 0, 0), this.drawContext(d, c, m, t, r);
		});
	}
	drawContextBounds(e, t, r, n, i) {
		return O(this, null, function* () {
			let o = r.x - t.x, l = new Point((t.x + r.x) / 2, (t.y + r.y) / 2);
			return this.drawContext(e, n, i, l, ct(o, n));
		});
	}
	drawCanvasBounds(o, l, a, c) {
		return O(this, arguments, function* (e, t, r, n, i = {}) {
			let m = r.x - t.x, d = new Point((t.x + r.x) / 2, (t.y + r.y) / 2);
			return this.drawCanvas(e, d, ct(m, n), i);
		});
	}
};
u(Ze, "Static");
var mt = Ze;
var Jt = u((s) => new Promise((e) => {
	setTimeout(() => {
		e();
	}, s);
}), "timer"), Wt = u((s) => s.then((e) => ({
	status: "fulfilled",
	value: e
}), (e) => ({
	status: "rejected",
	reason: e
})), "reflect"), Pn = u((s = {}) => {
	let t = class t extends L.GridLayer {
		constructor(n = {}) {
			var o;
			if (n.noWrap && !n.bounds && (n.bounds = [[-90, -180], [90, 180]]), n.attribution ??= "<a href=\"https://protomaps.com\">Protomaps</a> © <a href=\"https://openstreetmap.org/copyright\">OpenStreetMap</a>", super(n), n.flavor) {
				let l = C(n.flavor);
				this.paintRules = se(l), this.labelRules = oe(l, n.lang || "en"), this.backgroundColor = l.background;
			} else this.paintRules = n.paintRules || [], this.labelRules = n.labelRules || [], this.backgroundColor = n.backgroundColor;
			this.devicePixelRatio = (o = n.devicePixelRatio) != null ? o : window.devicePixelRatio, this.lastRequestedZ = void 0, this.tasks = n.tasks || [], this.views = ue(n), this.debug = n.debug;
			let i = document.createElement("canvas").getContext("2d");
			this.scratch = i, this.onTilesInvalidated = (l) => {
				for (let a of l) this.rerenderTile(a);
			}, this.labelers = new Z(this.scratch, this.labelRules, 16, this.onTilesInvalidated), this.tileSize = 256 * this.devicePixelRatio, this.tileDelay = n.tileDelay || 3, this.lang = n.lang;
		}
		renderTile(n, i, o, l = () => {}) {
			return O(this, null, function* () {
				this.lastRequestedZ = n.z;
				let a = [];
				for (let [z, A] of this.views) {
					let me = A.getDisplayTile(n);
					a.push({
						key: z,
						promise: me
					});
				}
				let c = yield Promise.all(a.map((z) => z.promise.then((A) => ({
					status: "fulfilled",
					value: A,
					key: z.key
				}), (A) => ({
					status: "rejected",
					reason: A,
					key: z.key
				})))), m = /* @__PURE__ */ new Map();
				for (let z of c) z.status === "fulfilled" ? m.set(z.key, [z.value]) : z.reason.name === "AbortError" || console.error(z.reason);
				if (i.key !== o || this.lastRequestedZ !== n.z || (yield Promise.all(this.tasks.map(Wt)), i.key !== o) || this.lastRequestedZ !== n.z) return;
				let d = this.labelers.add(n.z, m);
				if (i.key !== o || this.lastRequestedZ !== n.z) return;
				let f = this.labelers.getIndex(n.z);
				if (!this._map) return;
				let b = this._map.getCenter().wrap(), x = this._getTiledPixelBounds(b), w = this._pxBoundsToTileRange(x).getCenter();
				if (yield Jt(n.distanceTo(w) * this.tileDelay), i.key !== o || this.lastRequestedZ !== n.z) return;
				let p = 16, y = {
					minX: 256 * n.x - p,
					minY: 256 * n.y - p,
					maxX: 256 * (n.x + 1) + p,
					maxY: 256 * (n.y + 1) + p
				}, D = new Point(256 * n.x, 256 * n.y);
				i.width = this.tileSize, i.height = this.tileSize;
				let h = i.getContext("2d");
				if (!h) {
					console.error("Failed to get Canvas context");
					return;
				}
				h.setTransform(this.tileSize / 256, 0, 0, this.tileSize / 256, 0, 0), h.clearRect(0, 0, 256, 256), this.backgroundColor && (h.save(), h.fillStyle = this.backgroundColor, h.fillRect(0, 0, 256, 256), h.restore());
				let C = 0, P = this.paintRules;
				if (C = ce(h, n.z, m, this.xray ? null : f, P, y, D, !1, this.debug), this.debug) {
					h.save(), h.fillStyle = this.debug, h.font = "600 12px sans-serif", h.fillText(`${n.z} ${n.x} ${n.y}`, 4, 14), h.font = "12px sans-serif";
					let z = 28;
					for (let [A, me] of m) {
						let fe = me[0].dataTile;
						h.fillText(`${A + (A ? " " : "") + fe.z} ${fe.x} ${fe.y}`, 4, z), z += 14;
					}
					h.font = "600 10px sans-serif", C > 8 && (h.fillText(`${C.toFixed()} ms paint`, 4, z), z += 14), d > 8 && h.fillText(`${d.toFixed()} ms layout`, 4, z), h.strokeStyle = this.debug, h.lineWidth = .5, h.beginPath(), h.moveTo(0, 0), h.lineTo(0, 256), h.stroke(), h.lineWidth = .5, h.beginPath(), h.moveTo(0, 0), h.lineTo(256, 0), h.stroke(), h.restore();
				}
				l();
			});
		}
		rerenderTile(n) {
			for (let i in this._tiles) {
				let o = this._wrapCoords(this._keyToTileCoords(i));
				n === this._tileCoordsToKey(o) && this.renderTile(o, this._tiles[i].el, n);
			}
		}
		queryTileFeaturesDebug(n, i, o = 16) {
			let l = /* @__PURE__ */ new Map();
			for (let [a, c] of this.views) l.set(a, c.queryFeatures(n, i, this._map.getZoom(), o));
			return l;
		}
		clearLayout() {
			this.labelers = new Z(this.scratch, this.labelRules, 16, this.onTilesInvalidated);
		}
		rerenderTiles() {
			for (let n in this._tiles) {
				let i = this._wrapCoords(this._keyToTileCoords(n)), o = this._tileCoordsToKey(i);
				this.renderTile(i, this._tiles[n].el, o);
			}
		}
		createTile(n, i) {
			let o = L.DomUtil.create("canvas", "leaflet-tile");
			o.lang = this.lang;
			let l = this._tileCoordsToKey(n);
			return o.key = l, this.renderTile(n, o, l, () => {
				i(void 0, o);
			}), o;
		}
		_removeTile(n) {
			let i = this._tiles[n];
			i && (i.el.removed = !0, i.el.key = void 0, L.DomUtil.removeClass(i.el, "leaflet-tile-loaded"), i.el.width = i.el.height = 0, L.DomUtil.remove(i.el), delete this._tiles[n], this.fire("tileunload", {
				tile: i.el,
				coords: this._keyToTileCoords(n)
			}));
		}
	};
	u(t, "LeafletLayer");
	return new t(s);
}, "leafletLayer");
var Cn = u((s, e, t) => {
	let r = new FontFace(s, `url(${e})`, { weight: t });
	return document.fonts.add(r), r.load();
}, "Font"), dt = u((s) => O(void 0, null, function* () {
	return new Promise((e, t) => {
		let r = new Image();
		r.onload = () => e(r), r.onerror = () => t("Invalid SVG"), r.src = s;
	});
}), "mkimg"), Vt = `
<svg width="20px" height="20px" viewBox="0 0 50 50" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <rect width="50" height="50" fill="#cccccc"/>
    <g transform="translate(5,5)">
        <path fill="none" stroke="#666666" stroke-width="7" d="m11,12a8.5,8 0 1,1 17,0q0,4-4,6t-4.5,4.5-.4,4v.2m0,3v7"/>
    </g>
</svg>
`, qe = class qe {
	constructor(e) {
		this.src = e, this.canvas = document.createElement("canvas"), this.mapping = /* @__PURE__ */ new Map(), this.missingBox = {
			x: 0,
			y: 0,
			w: 0,
			h: 0
		};
	}
	load() {
		return O(this, null, function* () {
			let e = this.src, t = window.devicePixelRatio;
			e.endsWith(".html") && (e = yield (yield fetch(e)).text());
			let r = new window.DOMParser().parseFromString(e, "text/html"), n = Array.from(r.body.children), i = yield dt(`data:image/svg+xml;base64,${btoa(Vt)}`), o = [{
				w: i.width * t,
				h: i.height * t,
				img: i,
				id: ""
			}], l = new XMLSerializer();
			for (let m of n) {
				let b = yield dt(`data:image/svg+xml;base64,${btoa(l.serializeToString(m))}`);
				o.push({
					w: b.width * t,
					h: b.height * t,
					img: b,
					id: m.id
				});
			}
			let a = potpack(o);
			this.canvas.width = a.w, this.canvas.height = a.h;
			let c = this.canvas.getContext("2d");
			if (c) for (let m of o) m.x !== void 0 && m.y !== void 0 && (c.drawImage(m.img, m.x, m.y, m.w, m.h), m.id ? this.mapping.set(m.id, {
				x: m.x,
				y: m.y,
				w: m.w,
				h: m.h
			}) : this.missingBox = {
				x: m.x,
				y: m.y,
				w: m.w,
				h: m.h
			});
			return this;
		});
	}
	get(e) {
		let t = this.mapping.get(e);
		return t || (t = this.missingBox), t;
	}
};
u(qe, "Sheet");
var ht = qe;
//#endregion
export { ve as CenteredSymbolizer, j as CenteredTextSymbolizer, te as CircleSymbolizer, st as FlexSymbolizer, Cn as Font, we as GeomType, re as GroupSymbolizer, nt as IconSymbolizer, Je as Index, St as Justify, V as Labeler, Z as Labelers, Rt as LineLabelPlacement, $ as LineLabelSymbolizer, R as LineSymbolizer, Le as OffsetSymbolizer, ie as OffsetTextSymbolizer, ot as Padding, H as PmtilesSource, T as PolygonSymbolizer, ht as Sheet, it as ShieldSymbolizer, mt as Static, At as TextPlacements, ne as TextSymbolizer, ee as TileCache, Ee as View, Q as ZxySource, wr as arr, Yt as covering, yr as createPattern, Y as exp, ct as getZoom, vt as isCcw, tt as isInRing, oe as labelRules, Pn as leafletLayer, Te as linear, ce as paint, se as paintRules, Lt as pointInPolygon, Ct as pointMinDistToLines, Tt as pointMinDistToPoints, ue as sourcesToViews, zr as step, B as toIndex, le as transformGeom, ae as wrap };
