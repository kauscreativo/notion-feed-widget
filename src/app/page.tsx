import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID as string;

async function getPosts() {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [{ property: "Publish Date", direction: "descending" }],
    page_size: 60,
    filter: {
      or: [
        { property: "Formato", select: { equals: "Carrusel" } },
        { property: "Formato", select: { equals: "Reel/Tiktok" } },
      ],
    },
  });
  return response.results;
}

async function getImageUrl(page: any): Promise<string | null> {
  const attachments = (page.properties?.Attachment as any)?.files ?? [];
  if (attachments.length === 0) return null;
  const file = attachments[0];
  if (file.type === "file") return file.file.url;
  if (file.type === "external") return file.external.url;
  return null;
}

export default async function Home() {
  const pages = await getPosts();

  const posts = await Promise.all(
    pages.map(async (page: any) => {
      const imgUrl = await getImageUrl(page);
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
        <p style={{ fontWeight: 700, fontSize: "15px", margin: "0 0 4px" }}>@tu_cuenta</p>
        <p style={{ fontWeight: 600, fontSize: "13px", margin: "0 0 2px", color: "#111" }}>Tu Nombre · Tu Profesión</p>
        <p style={{ fontSize: "13px", color: "#333", margin: "0 0 4px", lineHeight: 1.4 }}>
          Tu descripción acá ✦ Lo que hacés y para quién
        </p>
        <a href="https://tu-sitio.com" style={{ fontSize: "13px", color: "#0095f6", textDecoration: "none", fontWeight: 600 }}>
          www.tu-sitio.com
        </a>
      </div>

      <div style={{ display: "flex", gap: "12px", padding: "0 16px 16px", overflowX: "auto" }}>
        {["Destacado 1", "Destacado 2", "Destacado 3"].map((h) => (
          <div key={h} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", border: "1.5px solid #dbdbdb", background: "#fafafa" }} />
            <span style={{ fontSize: "10px", color: "#333" }}>{h}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #dbdbdb" }} />

      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", borderBottom: "1px solid #dbdbdb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderBottom: "2px solid #111", paddingBottom: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#111", letterSpacing: "0.5px", textTransform: "uppercase" }}>Posts</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
        {ordered.map((post) => (
          <div key={post.id} style={{ aspectRatio: "4/5", position: "relative", overflow: "hidden", background: "#f0f0f0" }}>
            {post.imgUrl ? (
              <img src={post.imgUrl} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            )}
            {post.pinned && (
              <div style={{ position: "absolute", top: "5px", left: "5px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
              </div>
            )}
            {post.formato === "Reel/Tiktok" && (
              <div style={{ position: "absolute", top: "5px", right: "5px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
              </div>
            )}
            {post.formato === "Carrusel" && (
              <div style={{ position: "absolute", top: "5px", right: "5px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="6" width="5" height="12" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/><rect x="17" y="6" width="5" height="12" rx="1"/></svg>
              </div>
            )}
            {post.estado?.toLowerCase().includes("borrador") && (
              <div style={{ position: "absolute", bottom: "5px", left: "5px", background: "rgba(0,0,0,0.55)", color: "white", fontSize: "9px", padding: "2px 6px", borderRadius: "3px" }}>
                Borrador
              </div>
            )}
          </div>
        ))}
      </div>

    </main>
  );
}