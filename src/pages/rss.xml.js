import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  notes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  // base path（/study-memo/）を含めた絶対URLにする
  const base = import.meta.env.BASE_URL;

  return rss({
    title: 'study-memo｜勉強会メモ アーカイブ',
    description: '勉強会で学んだことを書き溜めておく場所。',
    site: new URL(base, context.site).toString(),
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.summary,
      pubDate: note.data.date,
      categories: note.data.tags,
      link: `${base}notes/${note.id}/`,
    })),
  });
}
