export default function parseHtmlFragment(str = '') {
  const t = document.createElement('template');
  t.innerHTML = str;
  return t.content;
}
