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
  eleventyConfig.addPassthroughCopy({ 'src/admin/config.yml': 'admin/config.yml' });

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
