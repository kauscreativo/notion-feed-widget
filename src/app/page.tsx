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
      <FeedClient posts={ordered} />
    </main>
  );
}