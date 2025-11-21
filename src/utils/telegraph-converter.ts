import { marked } from "marked";

interface TelegraphNode {
  tag?: string;
  attrs?: Record<string, string>;
  children?: (TelegraphNode | string)[];
}

export function markdownToTelegraph(markdown: string): TelegraphNode[] {
  const tokens = marked.lexer(markdown);
  return convertTokens(tokens);
}

function convertTokens(tokens: any[]): TelegraphNode[] {
  const nodes: TelegraphNode[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        // Telegraph only supports h3 and h4
        // Map h1/h2 -> h3, h3-h6 -> h4
        const tag = token.depth <= 2 ? "h3" : "h4";
        nodes.push({
          tag,
          children: convertInline(token.tokens),
        });
        break;
      }
      case "paragraph": {
        nodes.push({
          tag: "p",
          children: convertInline(token.tokens),
        });
        break;
      }
      case "list": {
        nodes.push({
          tag: token.ordered ? "ol" : "ul",
          children: token.items.map((item: any) => {
            // List items in marked can contain blocks if loose, or just inline tokens
            // For simplicity in Telegraph, we'll treat them as mostly inline or simple blocks
            // If item.tokens contains a paragraph, we just take its children
            const children = [];
            for (const childToken of item.tokens) {
              if (childToken.type === "paragraph") {
                children.push(...convertInline(childToken.tokens));
              } else if (childToken.type === "text") {
                children.push(
                  ...convertInline(
                    childToken.tokens || [
                      {
                        type: "text",
                        text: childToken.text,
                      },
                    ],
                  ),
                );
              } else {
                // Recurse for other blocks (like nested lists)
                children.push(...convertTokens([childToken]));
              }
            }
            return {
              tag: "li",
              children: children.length > 0 ? children : [" "],
            };
          }),
        });
        break;
      }
      case "blockquote": {
        nodes.push({
          tag: "blockquote",
          children: convertTokens(token.tokens),
        });
        break;
      }
      case "code": {
        nodes.push({
          tag: "pre",
          children: [
            {
              tag: "code",
              children: [token.text],
            },
          ],
        });
        break;
      }
      case "image": {
        nodes.push({
          tag: "figure",
          children: [
            {
              tag: "img",
              attrs: { src: token.href, alt: token.text },
            },
            {
              tag: "figcaption",
              children: [token.text],
            },
          ],
        });
        break;
      }
      case "hr": {
        nodes.push({ tag: "hr" });
        break;
      }
      case "space":
        break;
      default:
        // Fallback
        if (token.text) {
          // Try to parse as inline if it's an unknown block
          // or just push text
          nodes.push({
            tag: "p",
            children: [token.text],
          });
        }
        break;
    }
  }
  return nodes;
}

function convertInline(tokens: any[]): (TelegraphNode | string)[] {
  const children: (TelegraphNode | string)[] = [];

  if (!tokens) return [];

  for (const token of tokens) {
    switch (token.type) {
      case "text":
      case "escape":
        children.push(token.text);
        break;
      case "strong":
        children.push({
          tag: "b",
          children: convertInline(token.tokens),
        });
        break;
      case "em":
        children.push({
          tag: "i",
          children: convertInline(token.tokens),
        });
        break;
      case "codespan":
        children.push({
          tag: "code",
          children: [token.text],
        });
        break;
      case "link":
        children.push({
          tag: "a",
          attrs: { href: token.href },
          children: convertInline(token.tokens),
        });
        break;
      case "image":
        // Inline images are not well supported as inline elements in Telegraph
        // We'll just render the alt text
        children.push(`[Image: ${token.text}]`);
        break;
      default:
        if (token.text) children.push(token.text);
        break;
    }
  }
  return children;
}
