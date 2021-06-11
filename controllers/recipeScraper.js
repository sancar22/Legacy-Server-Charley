const cheerio = require('cheerio');
const fetch = require('node-fetch');
const _ = require('lodash');


const fetchWithTimeout = (url, options, timeout = 5000) => {
  return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeout)
      )
  ]);
}

const fetchHtml = (url) => {
  return fetchWithTimeout(url).then(res => res.text());
}

const parseHtml = (html) => {

  const $ = cheerio.load(html);
  const jsonld = $('script[type="application/ld+json"]').html();

  if (!jsonld) return false;
  const parsed = JSON.parse(jsonld);

  let recipe = {};
  if (!parsed.hasOwnProperty('recipeIngredient')) {
    recipe = parsed.filter(obj => obj['@type'] === 'Recipe')[0];
    if (!recipe) {
      recipe = parsed['@graph'].filter(obj => obj['@type'] === 'Recipe')[0];
    }
  }

  if (parsed.recipeIngredient) {
    return parsed;
  } else if (recipe.recipeIngredient) {
    return recipe;
  } else {
    return false;
  }
}

const handleScrape = async (req, res) => {
  try {
    const html = await fetchHtml(req.body.url);
    if (!html) throw new Error('is this even a website');

    const jsonld = parseHtml(html);
    if(!jsonld) throw new Error('no json ld');

    res.status(200).json(jsonld);

  } catch (e) {
    res.status(400).send(e.message);
  }

}






module.exports = { handleScrape}