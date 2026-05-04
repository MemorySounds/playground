const yaml = require('js-yaml');
const markdownIt = require('markdown-it');

const md = markdownIt({ html: true });

module.exports = function (eleventyConfig) {
  // Enable YAML data files (e.g. src/_data/home.yml)
  eleventyConfig.addDataExtension('yml', (contents) => yaml.load(contents));

  // Render markdown strings from YAML data in templates: {{ value | markdownify }}
  eleventyConfig.addFilter('markdownify', (str) => md.render(str ?? ''));

  // Copy static assets from project root into the output folder
  eleventyConfig.addPassthroughCopy({ assets: 'assets' });
  eleventyConfig.addPassthroughCopy({ 'styles.css': 'styles.css' });
  eleventyConfig.addPassthroughCopy({ scripts: 'scripts' });
  eleventyConfig.addPassthroughCopy('CNAME');

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
