import { siteConfig } from './lib/site-config'

export default siteConfig({
  // the site's root Notion page (required)
  rootNotionPageId: '1299ca88d014801c9b86c1464a181155',

  // if you want to restrict pages to a single notion workspace (optional)
  // (this should be a Notion ID; see the docs for how to extract this)
  rootNotionSpaceId: 'a7bf333d-3700-4ad8-a838-d8d324d5e599',

  // if you want to restrict pages to a single page in database (optional)
  // (this should be a Notion ID; see the docs for NotionAPI Docs; You use Retrieve a page API)
  rootDatabaseId: '1299ca88-d014-8185-8698-e0cfcd768679',

  // basic site info (required)
  name: 'Jhcode33 Tech Blog',
  domain: '',
  author: 'jhcode33',

  // open graph metadata (optional)
  description: 'jhcode33 blog -developer blog',

  // social usernames (optional)
  //twitter: 'transitive_bs',
  github: 'jhcode33',
  //linkedin: 'not-yet',
  // mastodon: '#', // optional mastodon profile URL, provides link verification
  // newsletter: '#', // optional newsletter URL
  // youtube: '#', // optional youtube channel name or `channel/UCGbXXXXXXXXXXXXXXXXXXXXXX`

  // default notion icon and cover images for site-wide consistency (optional)
  // page-specific values will override these site-wide defaults
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: true,

  // whether or not redis is enabled for caching generated preview images (optional)
  // NOTE: if you enable redis, you need to set the `REDIS_HOST` and `REDIS_PASSWORD`
  // environment variables. see the readme for more info
  isRedisEnabled: false,

  includeNotionIdInUrls: true,
  // map of notion page IDs to URL paths (optional)
  // any pages defined here will override their default URL paths
  // example:
  //
  // pageUrlOverrides: {
  //   '/foo': '067dd719a912471ea9a3ac10710e7fdf',
  //   '/bar': '0be6efce9daf42688f65c76b89f8eb27'
  // }
  pageUrlOverrides: null,

  // whether to use the default notion navigation style or a custom one with links to
  // important pages. To use `navigationLinks`, set `navigationStyle` to `custom`.
  // navigationStyle: 'default',
  navigationStyle: 'default',
  // navigationLinks: [
  //   {
  //     title: 'About',
  //     pageId: '1179ca88d01481c7a782f8ff7989136b'
  //   },
  //   {
  //     title: 'Portfolio',
  //     pageId: '1179ca88d01481c483e9f76a9a5116be'
  //   }
  // ],
  // -------- custom configs (2skydev) -------------

  // date-fns format string
  dateformat: 'yyyy년 MM월 dd일',

  // post page - hidden properties
  hiddenPostProperties: ['설명', '상태', '최하위 정렬'],

  // contentPosition (table of contents) text align
  contentPositionTextAlign: 'left',

  // default theme color
  defaultTheme: 'system',

  // enable comment
  enableComment: true,
})
