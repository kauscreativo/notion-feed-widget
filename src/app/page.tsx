import { Client } from "@notionhq/client";
import FeedClient from "./FeedClient";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID as string;

async function getPosts() {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [{ property: "Fecha de publicación", direction: "descending" }],
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
      const props = page.properties as Record<string, any>;

      const portada = props?.Portada?.files ?? [];
      const file = portada[0];
      let imgUrl: string | null = null;
      if (file?.type === "file") imgUrl = file.file.url;
      else if (file?.type === "external") imgUrl = file.external.url;

      const contenido = (props?.Contenido?.files ?? []).map((f: any) =>
        f.type === "file" ? f.file.url : f.external?.url ?? null
      ).filter(Boolean);

      const titleProp = Object.values(props).find((p: any) => p.type === "title") as any;
      const nombre = titleProp?.title?.[0]?.plain_text ?? "";
      const formato = props?.Formato?.select?.name ?? "";
      const estado = props?.Estado?.status?.name ?? props?.Estado?.select?.name ?? "";
      const copy = props?.Copy?.rich_text?.[0]?.plain_text ?? "";
      const notaImportante = props?.["Nota Importante"]?.rich_text?.[0]?.plain_text ?? "";
      const pinned = notaImportante === "pin";

      return { id: page.id, nombre, imgUrl, contenido, formato, estado, copy, pinned };
    })
  );

  const pinned = posts.filter((p) => p.pinned);
  const rest = posts.filter((p) => !p.pinned);
  const ordered = [...pinned, ...rest];

  return (
    <main style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: "480px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <FeedClient posts={ordered} />
    </main>
  );
}