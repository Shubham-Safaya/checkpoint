import { useEffect } from "react";
import { SITE_NAME } from "../siteConfig";

/** Per-route <title> + meta description + OG tags (SPA-side SEO pass, §11). */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} — ${SITE_NAME}`;
    setMeta("description", description);
    setMeta("og:title", `${title} — ${SITE_NAME}`, true);
    setMeta("og:description", description, true);
  }, [title, description]);
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** FAQ JSON-LD injection for guide pages. */
export function useFaqJsonLd(qas: { q: string; a: string }[]) {
  useEffect(() => {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "faq-jsonld";
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: qas.map((x) => ({
        "@type": "Question",
        name: x.q,
        acceptedAnswer: { "@type": "Answer", text: x.a },
      })),
    });
    document.getElementById("faq-jsonld")?.remove();
    document.head.appendChild(el);
    return () => { document.getElementById("faq-jsonld")?.remove(); };
  }, [qas]);
}
