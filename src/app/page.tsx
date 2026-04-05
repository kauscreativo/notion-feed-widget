import { Client } from "@notionhq/client";
import FeedClient from "./FeedClient";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID as string;

async function getPosts() {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [{ property: "Publish Date", direction: "descending" }],
    page_size: 30,
    filter: {
      or: [
        { property: "Formato", select: { equals: "Carrusel" } },
        { property: "Formato", select: { equals: "Reel/Tiktok" } },
      ],
    },
  });
  return response.results;
}

export default async function Home() {
  const pages = await getPosts();

  const posts = await Promise.all(
    pages.map(async (page: any) => {
      const attachments = (page.properties?.Attachment as any)?.files ?? [];
      const file = attachments[0];
      let imgUrl: string | null = null;
      if (file?.type === "file") imgUrl = file.file.url;
      else if (file?.type === "external") imgUrl = file.external.url;

      const titleProp = Object.values(page.properties as Record<string, any>).find(
        (p: any) => p.type === "title"
      ) as any;
      const title = titleProp?.title?.[0]?.plain_text ?? "";
      const formato = (page.properties as any)?.Formato?.select?.name ?? "";
      const estado =
        (page.properties as any)?.Estado?.status?.name ??
        (page.properties as any)?.Estado?.select?.name ?? "";
      const notaImportante = (page.properties as any)?.["Nota Importante"]?.rich_text?.[0]?.plain_text ?? "";
      const pinned = notaImportante === "pin";

      return { id: page.id, title, imgUrl, formato, estado, pinned };
    })
  );

  const pinned = posts.filter((p) => p.pinned);
  const rest = posts.filter((p) => !p.pinned);
  const ordered = [...pinned, ...rest];

  return (
    <main style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: "480px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>

      <div style={{ padding: "20px 16px 12px" }}>
        <p style={{ fontWeight: 700, fontSize: "15px", margin: "0 0 4px" }}>@rey_de_copas</p>
        <p style={{ fontWeight: 600, fontSize: "13px", margin: "0 0 2px", color: "#111" }}>Rey de Copas · Bar</p>
        <p style={{ fontSize: "13px", color: "#333", margin: "0 0 4px", lineHeight: 1.4 }}>
          Calendario de contenido ✦ Feed preview
        </p>
      </div>

      <div style={{ borderTop: "1px solid #dbdbdb" }} />

      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", borderBottom: "1px solid #dbdbdb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderBottom: "2px solid #111", paddingBottom: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#111", letterSpacing: "0.5px", textTransform: "uppercase" }}>Posts</span>
        </div>
      </div>

      <FeedClient posts={ordered} />

    </main>
  );
}