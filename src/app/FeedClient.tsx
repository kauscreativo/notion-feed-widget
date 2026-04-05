"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  title: string;
  imgUrl: string | null;
  formato: string;
  estado: string;
  pinned: boolean;
};

export default function FeedClient({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState("todos");
  const router = useRouter();

  const filtered = posts.filter((p) => {
    if (filter === "todos") return true;
    if (filter === "publicado") return p.estado?.toLowerCase().includes("publicad");
    return true;
  });

  const filters = [
    { key: "todos", label: "Todos" },
    { key: "publicado", label: "Publicados" },
  ];

  return (
    <>
      <div style={{ display: "flex", gap: "8px", padding: "12px 16px", flexWrap: "wrap", borderBottom: "1px solid #dbdbdb", alignItems: "center" }}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "5px 12px",
              borderRadius: "99px",
              border: "1px solid",
              borderColor: filter === f.key ? "#111" : "#dbdbdb",
              background: filter === f.key ? "#111" : "transparent",
              color: filter === f.key ? "#fff" : "#333",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: filter === f.key ? 600 : 400,
            }}
          >
            {f.label}
          </button>
        ))}

        <button
          onClick={() => router.refresh()}
          style={{
            marginLeft: "auto",
            padding: "5px 12px",
            borderRadius: "99px",
            border: "1px solid #dbdbdb",
            background: "transparent",
            color: "#333",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      <div style={{ padding: "8px 16px", fontSize: "11px", color: "#888" }}>
        {filtered.length} posts
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
        {filtered.map((post) => (
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
          </div>
        ))}
      </div>
    </>
  );
}