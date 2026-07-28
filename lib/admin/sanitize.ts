import DOMPurify from "isomorphic-dompurify";

// Blog bodies come from a trusted (email-allowlisted) admin editor, but we still
// sanitize on write so stored HTML is always safe to render with
// dangerouslySetInnerHTML. Allow only the tags the WYSIWYG toolbar can produce.
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "code", "pre",
  "h2", "h3", "ul", "ol", "li", "blockquote", "a", "hr"
];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeHtml(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/)/i
  });
  return clean.trim();
}
