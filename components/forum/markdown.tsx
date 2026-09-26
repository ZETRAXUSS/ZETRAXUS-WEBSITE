import { Fragment, type ReactNode } from "react";

/**
 * Tiny, safe Markdown renderer for forum posts.
 *
 * Supports: **bold**, *italic* / _italic_, ~~strike~~, `code`, fenced code
 * blocks, [links](https://…), bare URLs, ## / ### headings, > quotes,
 * - lists, 1. lists and --- rules.
 *
 * It never uses dangerouslySetInnerHTML — everything becomes React
 * elements, so user content cannot inject HTML or scripts. Only http(s)
 * links are rendered as anchors.
 */

const MEDIA_PREFIX = `${(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eicbvvrayoubpbkuttmi.supabase.co").trim()}/storage/v1/object/public/media/`;
const IMAGE_LINE = /^!\[([^\]\n]{0,200})\]\((\S{1,600})\)$/;

function ownImage(line: string): { alt: string; src: string } | null {
  const match = IMAGE_LINE.exec(line);
  return match && match[2].startsWith(MEDIA_PREFIX) ? { alt: match[1], src: match[2] } : null;
}

interface RenderOptions {
  /** Projects area: links are shown as plain text, never as anchors. */
  noLinks?: boolean;
}

const INLINE =
  /(`[^`\n]+`)|(\*\*[^*\n]+?\*\*)|(~~[^~\n]+?~~)|(\*[^*\s][^*\n]*?\*)|(\b_[^_\s][^_\n]*?_\b)|(\[[^\]\n]{1,200}\]\((https?:\/\/[^\s)]{1,500})\))|(https?:\/\/[^\s<]{2,500}[^\s<.,:;"')\]!?])/g;

function renderInline(text: string, keyPrefix: string, options: RenderOptions = {}): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  INLINE.lastIndex = 0;

  const regex = new RegExp(INLINE.source, "g");
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const key = `${keyPrefix}-${i++}`;
    const [token] = match;

    if (match[1]) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (match[2]) {
      nodes.push(<strong key={key}>{renderInline(token.slice(2, -2), key, options)}</strong>);
    } else if (match[3]) {
      nodes.push(<del key={key}>{renderInline(token.slice(2, -2), key, options)}</del>);
    } else if (match[4] || match[5]) {
      nodes.push(<em key={key}>{renderInline(token.slice(1, -1), key, options)}</em>);
    } else if (options.noLinks && (match[6] || match[8])) {
      nodes.push(token);
    } else if (match[6]) {
      const label = token.slice(1, token.indexOf("]("));
      const href = match[7];
      nodes.push(
        <a key={key} href={href} target="_blank" rel="nofollow noopener noreferrer ugc">
          {renderInline(label, key)}
        </a>,
      );
    } else if (match[8]) {
      nodes.push(
        <a key={key} href={token} target="_blank" rel="nofollow noopener noreferrer ugc">
          {token.length > 60 ? `${token.slice(0, 57)}…` : token}
        </a>,
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderLines(lines: string[], keyPrefix: string, options: RenderOptions = {}): ReactNode[] {
  return lines.map((line, index) => (
    <Fragment key={`${keyPrefix}-l${index}`}>
      {index > 0 && <br />}
      {renderInline(line, `${keyPrefix}-l${index}`, options)}
    </Fragment>
  ));
}

export function Markdown({
  source,
  className = "",
  noLinks = false,
  images = false,
}: {
  source: string;
  className?: string;
  noLinks?: boolean;
  /** Render `![](…)` lines — only for images hosted in our moderated bucket. */
  images?: boolean;
}) {
  const options: RenderOptions = { noLinks };
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced code
    if (trimmed.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre key={key++}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push(<hr key={key++} />);
      i++;
      continue;
    }

    // Image (own storage only)
    const image = images ? ownImage(trimmed) : null;
    if (image) {
      blocks.push(
        <figure key={key++} className="zx-md-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
          {image.alt && <figcaption>{image.alt}</figcaption>}
        </figure>,
      );
      i++;
      continue;
    }

    // Headings
    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const content = renderInline(heading[2], `h${key}`, options);
      blocks.push(heading[1].length === 3 ? <h3 key={key++}>{content}</h3> : <h2 key={key++}>{content}</h2>);
      i++;
      continue;
    }

    // Quote
    if (trimmed.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const k = key++;
      blocks.push(<blockquote key={k}>{renderLines(quote, `q${k}`, options)}</blockquote>);
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      const k = key++;
      blocks.push(
        <ul key={k}>
          {items.map((item, index) => (
            <li key={index}>{renderInline(item, `ul${k}-${index}`, options)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
        i++;
      }
      const k = key++;
      blocks.push(
        <ol key={k}>
          {items.map((item, index) => (
            <li key={index}>{renderInline(item, `ol${k}-${index}`, options)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph: consecutive non-special lines
    const paragraph: string[] = [];
    while (i < lines.length) {
      const current = lines[i].trim();
      if (
        !current ||
        current.startsWith("```") ||
        current.startsWith(">") ||
        /^#{1,3}\s+/.test(current) ||
        /^[-*]\s+/.test(current) ||
        /^\d+[.)]\s+/.test(current) ||
        /^(-{3,}|\*{3,})$/.test(current) ||
        (images && ownImage(current) !== null)
      ) {
        break;
      }
      paragraph.push(lines[i]);
      i++;
    }
    const k = key++;
    blocks.push(<p key={k}>{renderLines(paragraph, `p${k}`, options)}</p>);
  }

  return <div className={`zx-prose ${className}`}>{blocks}</div>;
}

/** Plain-text excerpt of a markdown body (for cards and search). */
export function markdownExcerpt(source: string, max = 180): string {
  const text = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
