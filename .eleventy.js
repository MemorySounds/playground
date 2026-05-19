const yaml = require('js-yaml');
const markdownIt = require('markdown-it');

const md = markdownIt({ html: true });

module.exports = function (eleventyConfig) {
  // Enable YAML data files (e.g. src/_data/home.yml)
  eleventyConfig.addDataExtension('yml', (contents) => yaml.load(contents));

  // Events collection — all .md files under src/events/, sorted newest first
  eleventyConfig.addCollection('events', (collectionApi) =>
    collectionApi.getFilteredByGlob('src/events/*.md').reverse(),
  );

  // Upcoming events: date >= today (includes today), sorted soonest first
  eleventyConfig.addCollection('upcomingEvents', (collectionApi) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return collectionApi
      .getFilteredByGlob('src/events/*.md')
      .filter(
        (post) => new Date(post.date).toISOString().split('T')[0] >= todayStr,
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  });

  // Past events: date < today, sorted most recent first
  eleventyConfig.addCollection('pastEvents', (collectionApi) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return collectionApi
      .getFilteredByGlob('src/events/*.md')
      .filter(
        (post) => new Date(post.date).toISOString().split('T')[0] < todayStr,
      )
      .reverse();
  });

  // Prev/next navigation for event posts (collection is newest-first)
  eleventyConfig.addFilter('prevEvent', (collection, url) => {
    const i = collection.findIndex((e) => e.url === url);
    return i !== -1 && i < collection.length - 1 ? collection[i + 1] : null;
  });
  eleventyConfig.addFilter('nextEvent', (collection, url) => {
    const i = collection.findIndex((e) => e.url === url);
    return i > 0 ? collection[i - 1] : null;
  });

  // Render markdown strings from YAML data in templates: {{ value | markdownify }}
  eleventyConfig.addFilter('markdownify', (str) => md.render(str ?? ''));

  // Date filters for news posts
  eleventyConfig.addFilter('htmlDateString', (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  });
  eleventyConfig.addFilter('readableDate', (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  // Copy static assets from project root into the output folder
  eleventyConfig.addPassthroughCopy({ assets: 'assets' });
  eleventyConfig.addPassthroughCopy({ 'styles.css': 'styles.css' });
  eleventyConfig.addPassthroughCopy({ scripts: 'scripts' });
  eleventyConfig.addPassthroughCopy('CNAME');
  // Copy the CMS config so it's served at /admin/config.yml
  eleventyConfig.addPassthroughCopy({
    'src/admin/config.yml': 'admin/config.yml',
  });
  eleventyConfig.addPassthroughCopy({ 'styles.css': 'styles.css' });

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
    },
    templateFormats: ['njk', 'html', 'md'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
  };
};
