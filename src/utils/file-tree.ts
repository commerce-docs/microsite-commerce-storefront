import { fromHtml } from 'hast-util-from-html';
import { toString } from 'hast-util-to-string';
import { h } from 'hastscript';
import type { Element, HChild } from 'hastscript/lib/core';
import { rehype } from 'rehype';
import { CONTINUE, SKIP, visit } from 'unist-util-visit';

/** Make a text node with the pass string as its contents. */
const Text = (value = ''): { type: 'text'; value: string } => ({
  type: 'text',
  value,
});

/** Convert an HTML string containing an SVG into a HAST element node. */
const makeSVGIcon = (svgString: string) => {
  const root = fromHtml(svgString, { fragment: true });
  const svg = root.children[0] as Element;
  svg.properties = {
    ...svg.properties,
    width: 16,
    height: 16,
    class: 'tree-icon',
    'aria-hidden': 'true',
  };
  return svg;
};

// const FileIcon = (filename: string) => {
//   const { svg } = getIcon(filename);
//   return makeSVGIcon(svg);
// };

const FileIcon = makeSVGIcon(
  `<svg viewBox="0 0 24 24">
		<g margin-left="0.25rem" margin-right="0" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
		<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"/>
		</g>
	</svg>`
);

const FolderIcon = makeSVGIcon(
  `<svg viewBox="0 0 24 24">
		<g margin="1rem" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
		<path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2Z"/>
		</g>
	</svg>`
);

export const fileTreeProcessor = rehype().use(() => (tree, file) => {
  const { directoryLabel } = file.data as { directoryLabel: string };
  visit(tree, 'element', (node) => {
    // Strip nodes that only contain newlines
    node.children = node.children.filter(
      (child) => child.type === 'comment' || child.type !== 'text' || !/^\n+$/.test(child.value)
    );

    if (node.tagName !== 'li') return CONTINUE;

    // Ensure node has properties so we can assign classes later.
    if (!node.properties) node.properties = {};

    const [firstChild, ...otherChildren] = node.children;

    const comment: HChild[] = [];
    if (firstChild?.type === 'text') {
      const [filename, ...fragments] = firstChild.value.split(' ');
      firstChild.value = filename || '';
      comment.push(fragments.join(' '));
    }
    const subTreeIndex = otherChildren.findIndex(
      (child) => child.type === 'element' && child.tagName === 'ul'
    );
    const commentNodes =
      subTreeIndex > -1 ? otherChildren.slice(0, subTreeIndex) : [...otherChildren];
    otherChildren.splice(0, subTreeIndex > -1 ? subTreeIndex : otherChildren.length);
    comment.push(...commentNodes);

    const firstChildTextContent = toString(firstChild);

    // Decide a node is a directory if it ends in a `/` or contains another list.
    const isDirectory =
      /\/\s*$/.test(firstChildTextContent) ||
      otherChildren.some((child) => child.type === 'element' && child.tagName === 'ul');
    const isPlaceholder = /^\s*(\.{3}|…)\s*$/.test(firstChildTextContent);
    const isHighlighted = firstChild.type === 'element' && firstChild.tagName === 'strong';
    const hasContents = otherChildren.length > 0;

    const fileExtension = isDirectory ? 'dir' : firstChildTextContent.trim().split('.').pop() || '';

    const icon = h('span', isDirectory ? FolderIcon : FileIcon);
    if (!icon.properties) icon.properties = {};
    if (isDirectory) {
      icon.children.unshift(h('span', { class: 'sr-only' }, directoryLabel));
    }

    node.properties.class = isDirectory ? 'directory' : 'file';
    if (isPlaceholder) node.properties.class += ' empty';
    node.properties['data-filetype'] = fileExtension;

    const treeEntry = h(
      'span',
      { class: 'tree-entry' },
      h('span', { class: isHighlighted ? 'highlight' : '' }, [
        isPlaceholder ? null : icon,
        firstChild,
      ]),
      Text(comment.length > 0 ? ' ' : ''),
      comment.length > 0 ? h('span', { class: 'comment' }, ...comment) : Text()
    );

    if (isDirectory) {
      node.children = [
        h('details', { open: false }, [
          h('summary', treeEntry),
          ...(hasContents ? otherChildren : [h('ul', h('li', '…'))]),
        ]),
      ];
      // Continue down the tree.
      return CONTINUE;
    }

    node.children = [treeEntry, ...otherChildren];

    // Files can't contain further files or directories, so skip iterating children.
    return SKIP;
  });
});
