const sanitizeHtml = require("sanitize-html");

const sanitizeContent = (content) => {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "p",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "em",
    ]),
    allowedAttributes: {
      img: ["src", "alt", "width", "height", "style"],
      a: ["href", "name", "target"],
      "*": ["style"], // Tüm etiketler için 'style' özniteliğine izin veriyoruz.
    },
    allowedSchemes: ["http", "https", "mailto"], // Güvenli URL şemalarına izin ver
    allowedSchemesAppliedToAttributes: ["href", "src"],
  });
}


module.exports = sanitizeContent;