import { test } from 'node:test'
import assert from 'node:assert/strict'
// @ts-ignore Node's built-in TS runner requires explicit .ts extensions.
import { publicationSlot, validateArticle, overlapsSource } from '../src/lib/insights/schema.ts'
// @ts-ignore Node's built-in TS runner requires explicit .ts extensions.
import { canonicalSource, parseFeed, plainText, FEEDS } from '../src/lib/insights/sources.ts'

test('publication window uses Sri Lanka Saturday and schedules 09:00', () => {
  assert.equal(publicationSlot(new Date('2026-11-07T03:15:00Z'))?.publishAt, '2026-11-07T03:30:00.000Z')
  assert.equal(publicationSlot(new Date('2026-11-07T03:14:59Z')), null)
  assert.equal(publicationSlot(new Date('2026-11-07T04:30:01Z')), null)
  assert.equal(publicationSlot(new Date('2026-11-08T03:30:00Z')), null)
  assert.equal(publicationSlot(new Date('2026-11-14T03:30:00Z'))?.week, '2026-11-14')
})
test('source URLs reject SSRF, credentials, ports and wrong publishers', () => {
  for (const url of ['http://blog.google/x', 'https://127.0.0.1/', 'https://blog.google.evil.test/', 'https://user@blog.google/x', 'https://blog.google:444/x']) assert.throws(() => canonicalSource(url, ['blog.google']))
  assert.equal(canonicalSource('https://blog.google/x/?utm_source=foo#top', ['blog.google']), 'https://blog.google/x')
})
test('RSS excludes old, future, missing-date and non-publisher links', () => {
  const item = (date: string, url = 'https://blog.google/ai/test') => `<item><title><![CDATA[Title &amp; news]]></title><link>${url}</link><pubDate>${date}</pubDate><description><![CDATA[<p>Evidence</p>]]></description></item>`
  const xml = '<rss>' + item('2026-11-06T00:00:00Z') + item('2026-10-01T00:00:00Z') + item('2026-11-08T00:00:00Z') + item('') + item('2026-11-06T00:00:00Z', 'https://evil.test/x') + '</rss>'
  const sources = parseFeed(xml, FEEDS[0], Date.parse('2026-11-07T03:15:00Z'))
  assert.equal(sources.length, 1); assert.equal(sources[0].title, 'Title & news'); assert.equal(sources[0].text, 'Evidence')
})
test('HTML scripts and broken numeric entities are not used as evidence', () => {
  assert.equal(plainText('<script>bad()</script><p>Hello &#99999999; world</p>'), 'Hello world')
})
test('article gate rejects malformed, HTML and non-Sinhala outputs', () => {
  assert.throws(() => validateArticle({}))
  const article = { title: 'A sufficiently long English title', slug: 'test', excerpt: 'A long English description about technology '.repeat(3), category: 'AI', sections: Array.from({ length: 4 }, () => ({ heading: 'Example section', paragraphs: ['These are English words without Sinhala language content. '.repeat(30)] })), takeaways: ['Example takeaway number one', 'Example takeaway number two', 'Example takeaway number three'] }
  assert.throws(() => validateArticle(article), /quality_language/)
  assert.throws(() => validateArticle({ ...article, title: '<script>alert(1)</script>' }))
  assert.equal(overlapsSource(article as never, article.sections[0].paragraphs[0]), true)
})
