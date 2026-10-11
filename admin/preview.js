// CMS preview templates and editor blocks.
// Templates mirror src/*.njk and src/_includes/*.njk. Keep them in sync.

CMS.registerPreviewStyle('/styles.css');
CMS.registerPreviewStyle(
  `/* Shorter hero so the content is visible while editing. */
  :root { --vh: 2.4px; }
  .right-audio-menu { height: 100vh; }

  .preview-note {
    margin: 0 0 2rem;
    padding: 0.6rem 0.9rem;
    border: 1px dashed #000;
    font-size: 0.8rem;
    text-align: left;
  }`,
  { raw: true },
);

const NAV = [
  ['/', 'intro'],
  ['/presentation/', 'presentation'],
  ['/references/', 'references'],
  ['/events/', 'happenings'],
  ['/contact/', 'contact'],
];

const LANGS = ['fr', 'en'];

// ── Helpers ──────────────────────────────────────────────────────────────

// marked here, markdown-it on the site.
const markdown = (text) => ({
  __html: DOMPurify.sanitize(marked.parse(text ?? '')),
});

// Links a preview element to its field in the editor.
const field = (keyPath) => ({ 'data-key-path': keyPath });

// Same inline display toggle as setLanguage() in spa.js.
const shown = (lang, l) => ({
  style: { display: lang === l ? 'block' : 'none' },
});

const toDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Same as the date filters in .eleventy.js.
const htmlDateString = (value) =>
  toDate(value)?.toISOString().split('T')[0] ?? '';
const readableDate = (value) =>
  toDate(value)?.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) ?? '';

// Matches Nunjucks' truncate filter.
const truncate = (text, length) => {
  if (text.length <= length) return text;
  const space = text.lastIndexOf(' ', length);
  return `${text.slice(0, space === -1 ? length : space)}...`;
};

// Eleventy's default collection order.
const oldestFirst = (a, b) =>
  (toDate(a.date) ?? 0) - (toDate(b.date) ?? 0) ||
  String(a.path).localeCompare(String(b.path));

const flatten = (value, prefix = '', out = {}) => {
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    Object.entries(value).forEach(([key, item]) =>
      flatten(item, prefix ? `${prefix}.${key}` : key, out),
    );
  } else {
    out[prefix] = value;
  }
  return out;
};

// Language of the field that just changed, so the preview can follow it.
const editedLanguage = (before, after) => {
  const old = flatten(before);
  const changed = Object.entries(flatten(after))
    .filter(([key, value]) => old[key] !== value)
    .map(([key]) => key.match(/[._](fr|en)$/)?.[1])
    .filter(Boolean);
  return new Set(changed).size === 1 ? changed[0] : null;
};

// ── Site frame (base.njk) ────────────────────────────────────────────────

const frame = ({ active, lang, navOpen, toggleLang, toggleNav }, content) => [
  h(
    'div',
    { key: 'video', className: 'video-wrapper' },
    h('video', {
      className: 'video-bg',
      src: '/assets/video/background-video1.mp4',
      autoPlay: true,
      loop: true,
      muted: true,
      playsInline: true,
    }),
    h('div', { className: 'flicker-overlay' }),
  ),
  h(
    'header',
    { key: 'header', className: 'main-header' },
    h(
      'h1',
      { id: 'playground-title' },
      h('a', { style: { textDecoration: 'none', color: 'inherit' } }, 'PLAYGROUND'),
    ),
    h(
      'button',
      {
        id: 'main-menu-toggle',
        className: `main-menu-toggle${navOpen ? ' open' : ''}`,
        onClick: toggleNav,
      },
      h('span'),
      h('span'),
      h('span'),
    ),
  ),
  h(
    'nav',
    { key: 'nav', className: `main-nav${navOpen ? ' open' : ''}` },
    h(
      'ul',
      null,
      NAV.map(([href, label]) =>
        h(
          'li',
          { key: href },
          h('a', { className: href === active ? 'active' : undefined }, label),
        ),
      ),
    ),
    h(
      'button',
      { id: 'language-toggle', onClick: toggleLang },
      lang === 'en' ? 'FRANÇAIS' : 'ENGLISH',
    ),
  ),
  h(
    'div',
    { key: 'audio', className: 'right-audio-menu' },
    h(
      'div',
      { className: 'audio-player' },
      h(
        'button',
        { id: 'audio-toggle', className: 'audio-btn' },
        h(
          'svg',
          { width: 16, height: 16, viewBox: '0 0 16 16' },
          h('polygon', { points: '3,2 13,8 3,14', fill: 'white' }),
        ),
      ),
      h('div', { id: 'time-remaining', className: 'time-display' }, '00:00'),
      h('input', {
        type: 'range',
        id: 'audio-progress',
        className: 'audio-progress',
        min: 0,
        max: 100,
        defaultValue: 0,
      }),
    ),
  ),
  h(
    'button',
    { key: 'audio-toggle', id: 'audio-menu-toggle', className: 'audio-menu-toggle' },
    h('span'),
    h('span'),
    h('span'),
  ),
  h('main', { key: 'main', className: 'main-content' }, content),
];

// Wraps a page body in the site frame. `events` loads the events collection.
const sitePage = (active, body, { events = false } = {}) =>
  createClass({
    getInitialState() {
      return { lang: 'fr', navOpen: false, events: [] };
    },

    componentDidMount() {
      if (!events) return;
      Promise.resolve(this.props.getCollection('events'))
        .then((entries) =>
          this.setState({
            events: entries.map((entry) => {
              const { slug, path, data } = entry.toJS();
              return { ...data, slug, path };
            }),
          }),
        )
        .catch((error) => console.warn('Preview: events not loaded', error));
    },

    componentDidUpdate(prevProps) {
      const lang = editedLanguage(
        prevProps.entry.get('data')?.toJS(),
        this.props.entry.get('data')?.toJS(),
      );
      if (lang && lang !== this.state.lang) this.setState({ lang });
    },

    render() {
      const { lang, navOpen } = this.state;
      const data = this.props.entry.get('data')?.toJS() ?? {};

      return frame(
        {
          active,
          lang,
          navOpen,
          toggleLang: () => this.setState({ lang: lang === 'fr' ? 'en' : 'fr' }),
          toggleNav: () => this.setState({ navOpen: !navOpen }),
        },
        body({ ...this.props, data, lang, events: this.state.events }),
      );
    },
  });

// ── Page bodies ──────────────────────────────────────────────────────────

// src/index.njk
const home = ({ data, lang }) =>
  LANGS.map((l) =>
    h(
      'div',
      { key: l, id: `content-${l}`, className: 'language-content', ...shown(lang, l) },
      h('div', {
        className: l === 'fr' ? 'greeting-message-fr' : 'greeting-message',
        ...field(`greeting_${l}`),
        dangerouslySetInnerHTML: markdown(data[`greeting_${l}`]),
      }),
      h(
        'div',
        { className: 'constitution' },
        h(
          'ul',
          { className: 'playground-list' },
          (data.constitution ?? []).map((item, i) =>
            h(
              'li',
              { key: i },
              h('span', { className: 'playground' }, 'PLAYGROUND'),
              h('span', { className: 'desc', ...field(`constitution.${i}.${l}`) }, item?.[l] ?? ''),
            ),
          ),
        ),
      ),
    ),
  );

// presentation.njk has no .language-content class, the others do.
const bilingualBody = (className) => ({ data, lang }) =>
  LANGS.map((l) =>
    h('div', {
      key: l,
      id: `content-${l}`,
      className,
      ...shown(lang, l),
      ...field(`body_${l}`),
      dangerouslySetInnerHTML: markdown(data[`body_${l}`]),
    }),
  );

// src/archive.njk, minus the password gate.
const archive = (props) =>
  h(
    'div',
    { id: 'archive-content' },
    h('p', { className: 'preview-note' }, 'On the site, this page sits behind the password.'),
    bilingualBody('language-content')(props),
  );

// src/events.njk
const eventCard = (post, lang) =>
  h(
    'li',
    { key: post.slug, className: 'events-grid-item' },
    h(
      'a',
      { className: `events-grid-card${post.cover_image ? '' : ' no-cover'}` },
      h(
        'div',
        { className: 'card-default' },
        h(
          'time',
          { className: 'card-mobile-date', dateTime: htmlDateString(post.date) },
          readableDate(post.date),
        ),
        h(
          'div',
          { className: 'card-img-wrap' },
          post.cover_image &&
            h('img', { src: post.cover_image, alt: '', className: 'card-primary-img' }),
        ),
        h(
          'div',
          { className: 'card-info' },
          LANGS.map((l) =>
            h(
              'span',
              {
                key: l,
                'data-lang': l,
                className: 'language-content events-grid-title',
                ...shown(lang, l),
              },
              truncate(String(post[`title_${l}`] || post.title || ''), 60),
            ),
          ),
        ),
      ),
      h(
        'div',
        { className: 'card-hover-face' },
        h('img', {
          src: post.hover_image || post.cover_image || '/assets/images/red.jpg',
          alt: '',
          className: 'card-hover-img',
        }),
        h(
          'div',
          { className: 'card-meta' },
          h(
            'time',
            { className: 'events-grid-date', dateTime: htmlDateString(post.date) },
            readableDate(post.date),
          ),
          post.author && h('span', { className: 'events-grid-author' }, post.author),
        ),
      ),
    ),
  );

const eventsSection = ({ lang, heading, empty, posts, past }) =>
  h(
    'div',
    { className: `events-section${past ? ' events-section--past' : ''}` },
    h(
      'div',
      { className: 'events-section-heading' },
      LANGS.map((l, i) =>
        h('span', { key: l, 'data-lang': l, className: 'language-content', ...shown(lang, l) }, heading[i]),
      ),
    ),
    posts.length
      ? h('ul', { className: 'events-grid' }, posts.map((post) => eventCard(post, lang)))
      : h(
          'div',
          { className: 'events-empty' },
          LANGS.map((l, i) =>
            h(
              'span',
              { key: l, 'data-lang': l, className: 'language-content', ...shown(lang, l) },
              h('em', null, empty[i]),
            ),
          ),
        ),
  );

// Same split as upcomingEvents and pastEvents in .eleventy.js.
const eventsPage = ({ data, lang, events }) => {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = events
    .filter((post) => htmlDateString(post.date) >= today)
    .sort((a, b) => (toDate(a.date) ?? 0) - (toDate(b.date) ?? 0));
  const past = events
    .filter((post) => htmlDateString(post.date) < today)
    .sort(oldestFirst)
    .reverse();

  return h(
    'div',
    { className: 'news-listing' },
    LANGS.map((l) =>
      h('div', {
        key: l,
        id: `content-${l}`,
        className: 'language-content',
        ...shown(lang, l),
        ...field(`heading_${l}`),
        dangerouslySetInnerHTML: markdown(data[`heading_${l}`]),
      }),
    ),
    eventsSection({
      lang,
      heading: ['À venir', 'Will Happen'],
      empty: ['Aucun événement à venir.', 'No upcoming happenings.'],
      posts: upcoming,
    }),
    eventsSection({
      lang,
      heading: ['Passés', 'Happened'],
      empty: ['Aucun événement passé.', 'No past events.'],
      posts: past,
      past: true,
    }),
  );
};

// src/_includes/post.njk
const eventPost = ({ data, lang, events, entry, getAsset }) => {
  const slug = entry.get('slug') || '__new';
  const cover = data.cover_image && (getAsset(data.cover_image) ?? data.cover_image);

  // Newest first, so "Previous" is the newer event.
  const ordered = [
    ...events.filter((post) => post.slug !== slug),
    { slug, date: data.date, path: entry.get('path') },
  ]
    .sort(oldestFirst)
    .reverse();
  const at = ordered.findIndex((post) => post.slug === slug);
  const prev = ordered[at - 1];
  const next = ordered[at + 1];

  return h(
    'article',
    { className: 'news-post' },
    cover &&
      h(
        'div',
        { className: 'post-cover', ...field('cover_image') },
        h('img', { src: String(cover), alt: data.title_fr || data.title_en || data.title || '' }),
      ),
    h(
      'header',
      { className: 'post-header' },
      LANGS.map((l) =>
        h(
          'div',
          { key: l, 'data-lang': l, className: 'language-content', ...shown(lang, l) },
          h('h2', { className: 'post-title', ...field(`title_${l}`) }, data[`title_${l}`] || data.title || ''),
        ),
      ),
      h(
        'div',
        { className: 'post-meta' },
        h('time', { dateTime: htmlDateString(data.date), ...field('date') }, readableDate(data.date)),
        data.author && h('span', { className: 'post-author', ...field('author') }, ` — ${data.author}`),
      ),
    ),
    LANGS.map((l) =>
      h('div', {
        key: l,
        'data-lang': l,
        className: 'language-content post-body',
        ...shown(lang, l),
        ...field(`body_${l}`),
        dangerouslySetInnerHTML: markdown(data[`body_${l}`]),
      }),
    ),
    h(
      'footer',
      { className: 'post-footer' },
      h('a', { className: 'back-link' }, 'All Happenings'),
      h(
        'div',
        { className: 'event-nav-buttons' },
        prev && h('a', { className: 'back-link' }, h('span', { className: 'back-arrow' }, '←'), 'Previous'),
        next && h('a', { className: 'back-link' }, 'Next', h('span', { className: 'back-arrow' }, '→')),
      ),
    ),
  );
};

// ── Registration ─────────────────────────────────────────────────────────

// Names match config.yml.

CMS.registerPreviewTemplate('home', sitePage('/', home));
CMS.registerPreviewTemplate('presentation', sitePage('/presentation/', bilingualBody()));
CMS.registerPreviewTemplate('references', sitePage('/references/', bilingualBody('language-content')));
CMS.registerPreviewTemplate('contact', sitePage('/contact/', bilingualBody('language-content')));
CMS.registerPreviewTemplate('events_page', sitePage('/events/', eventsPage, { events: true }));
CMS.registerPreviewTemplate('archive', sitePage(null, archive));
CMS.registerPreviewTemplate('events', sitePage('/events/', eventPost, { events: true }));

// ── Editor blocks ────────────────────────────────────────────────────────

// Aligned text. The blank lines inside the div keep its Markdown rendering.
// CSS: .align-* in styles/_layout.scss.
CMS.registerEditorComponent({
  id: 'aligned-text',
  label: 'Aligned text',
  icon: 'format_align_center',
  fields: [
    {
      name: 'align',
      label: 'Alignment',
      widget: 'select',
      default: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Centre', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    { name: 'text', label: 'Text', widget: 'markdown' },
  ],
  pattern: /^<div class="align-(?<align>left|center|right)">\n\n(?<text>[\s\S]*?)\n\n<\/div>$/m,
  // Both get called with empty props on init.
  toBlock: ({ align, text }) =>
    `<div class="align-${align || 'center'}">\n\n${String(text ?? '').trim()}\n\n</div>`,
  toPreview: ({ align, text }) =>
    `<div style="text-align: ${align || 'center'}">${markdown(text).__html}</div>`,
});
