/**
 * rehype-sections
 *
 * Markdown の `## 見出し` を境界にして、その見出し以降の内容を
 * `<section>` でグルーピングし、`.sec-num`（01, 02 ...）を
 * 自動採番して差し込む。これにより、執筆者は素のマークダウンで章を書くだけで、
 * 共通デザインと同じ章立て・装飾が得られる。
 *
 * - h2 の id（Astro がスラッグから自動付与）はそのまま残すので、目次のアンカーは機能する。
 * - h2 より前にある要素（導入文など）はラップせずにそのまま残す。
 */
export default function rehypeSections() {
  return (tree) => {
    const out = [];
    let current = null;
    let count = 0;

    for (const node of tree.children) {
      const isH2 = node.type === 'element' && node.tagName === 'h2';

      if (isH2) {
        count += 1;
        const num = String(count).padStart(2, '0');
        const secNum = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['sec-num'] },
          children: [{ type: 'text', value: num }],
        };
        current = {
          type: 'element',
          tagName: 'section',
          properties: {},
          children: [secNum, node],
        };
        out.push(current);
      } else if (current) {
        current.children.push(node);
      } else {
        out.push(node);
      }
    }

    tree.children = out;
  };
}
