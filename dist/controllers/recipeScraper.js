"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const uuid_1 = __importDefault(require("uuid"));
const user_1 = __importDefault(require("../models/user"));
const fetchWithTimeout = (url, options, timeout = 5000) => Promise.race([
    node_fetch_1.default(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
]);
const fetchHtml = (url) => fetchWithTimeout(url).then((res) => res.text());
const parseHtml = (html) => {
    const $ = cheerio_1.default.load(html);
    const jsonld = $('script[type="application/ld+json"]').html();
    if (!jsonld)
        return false;
    const recipe = JSON.parse(jsonld);
    let nestedRecipe = {};
    if (!recipe.hasOwnProperty('recipeIngredient')) {
        if (Array.isArray(recipe)) {
            nestedRecipe = recipe.filter((obj) => obj['@type'] === 'Recipe')[0];
        }
        else if (nestedRecipe !== {}) {
            nestedRecipe = recipe['@graph'].filter((obj) => obj['@type'] === 'Recipe')[0];
        }
    }
    if (recipe.recipeIngredient) {
        return recipe;
    }
    if (nestedRecipe.recipeIngredient) {
        return nestedRecipe;
    }
    return false;
};
const extractData = (jsonld) => {
    const desiredKeys = [
        'name',
        'keywords',
        'recipeYield',
        'recipeIngredient',
        'image',
        'recipeInstructions',
        'publisher',
        'author',
    ];
    let recipe = {};
    for (let key of desiredKeys) {
        if (jsonld.hasOwnProperty(key)) {
            if (key === 'keywords' && typeof jsonld[key] === 'string') {
                recipe[key] = jsonld[key].split(',');
            }
            else if (key === 'image' && Array.isArray(jsonld[key])) {
                recipe[key] = jsonld[key][0];
            }
            else if (key === 'image' && jsonld[key].hasOwnProperty('url')) {
                recipe[key] = jsonld[key].url;
            }
            else if (key === 'recipeYield' && typeof jsonld[key] !== 'string') {
                recipe[key] = '';
            }
            else if (key === 'recipeInstructions') {
                recipe[key] = jsonld[key].map((obj) => obj.text);
            }
            else if (key === 'publisher') {
                if (jsonld[key].hasOwnProperty('name'))
                    recipe[key] = jsonld[key].name;
            }
            else if (key === 'author') {
                if (Array.isArray(jsonld[key])) {
                    recipe[key] = jsonld[key].map((obj) => obj.name).join(',');
                }
                else if (jsonld[key].hasOwnProperty('name')) {
                    recipe[key] = jsonld[key].name;
                }
            }
            else if (key === 'recipeYield' ||
                key === 'keywords' ||
                key === 'image' ||
                key === 'name' ||
                key === 'recipeIngredient') {
                recipe[key] = jsonld[key];
            }
        }
    }
    return recipe;
};
const handleScrape = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = req.body.url;
        const html = yield fetchHtml(url);
        const jsonld = parseHtml(html);
        if (!jsonld)
            throw new Error('no json ld');
        let recipe = extractData(jsonld);
        recipe.url = url;
        recipe.id = uuid_1.default.v4();
        recipe.notes = [];
        const user = yield user_1.default.findById(req.body._id);
        recipe.origin = user.username;
        // save to user document
        yield user_1.default.findByIdAndUpdate(req.body._id, { $push: { recipeStore: recipe } }, { new: true });
        res.status(200).json(recipe);
    }
    catch (e) {
        console.log(e);
        res.status(400).send(e.message);
    }
});
exports.default = { handleScrape };
//# sourceMappingURL=recipeScraper.js.map