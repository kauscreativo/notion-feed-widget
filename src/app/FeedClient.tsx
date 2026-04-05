"use client";

import { useState, useTransition } from "react";
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
  const [showBio, setShowBio] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPending, startTransition] = useTransition();
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

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <>
      {/* BIO TOGGLE */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 16px 0" }}>
        <button
          onClick={() => setShowBio(!showBio)}
          style={{ background: "none", border: "none", fontSize: "11px", color: "#888", cursor: "pointer", textDecoration: "underline" }}
        >
          {showBio ? "Ocultar bio" : "Mostrar bio"}
        </button>
      </div>

      {/* BIO */}
      {showBio && (
        <div style={{ padding: "10px 16px 12px" }}>
          <p style={{ fontWeight: 700, fontSize: "15px", margin: "0 0 2px" }}>@rey_de_copas</p>
          <p style={{ fontWeight: 600, fontSize: "13px", margin: "0 0 2px", color: "#111" }}>Rey de Copas · Bar</p>
          <p style={{ fontSize: "13px", color: "#333", margin: 0, lineHeight: 1.4 }}>
            Calendario de contenido ✦ Feed preview
          </p>
        </div>
      )}

      <div style={{ borderTop: "1px solid #dbdbdb" }} />

      {/* TABS */}
      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", borderBottom: "1px solid #dbdbdb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderBottom: "2px solid #111", paddingBottom: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#111", letterSpacing: "0.5px", textTransform: "uppercase" }}>Posts</span>
        </div>
      </div>

      {/* FILTROS */}
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
          onClick={handleRefresh}
          disabled={isPending}
          style={{
            marginLeft: "auto",
            padding: "5px 12px",
            borderRadius: "99px",
            border: "1px solid #dbdbdb",
            background: "transparent",
            color: isPending ? "#bbb" : "#333",
            fontSize: "12px",
            cursor: isPending ? "wait" : "pointer",
          }}
        >
          {isPending ? "Actualizando..." : "↻ Refresh"}
        </button>
      </div>

      <div style={{ padding: "8px 16px", fontSize: "11px", color: "#888" }}>
        {filtered.length} posts
      </div>

      {/* GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
        {filtered.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            style={{ aspectRatio: "4/5", position: "relative", overflow: "hidden", background: "#f0f0f0", cursor: "pointer" }}
          >
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

      {/* MODAL */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 999, padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "12px",
              width: "min(400px, 95vw)",
              overflow: "hidden",
              position: "relative"
            }}
          >
            {/* Header modal */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #dbdbdb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "white", fontSize: "10px", fontWeight: 700 }}>RC</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>rey_de_copas</span>
              </div>
              <button onClick={() => setSelectedPost(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#333", lineHeight: 1 }}>×</button>
            </div>

            {/* Imagen */}
            {selectedPost.imgUrl ? (
              <img
                src={selectedPost.imgUrl}
                alt={selectedPost.title}
                style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: "4/5", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#ccc", fontSize: "13px" }}>Sin imagen</span>
              </div>
            )}

            {/* Info */}
            <div style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                {selectedPost.formato && (
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", border: "1px solid #dbdbdb", color: "#555" }}>{selectedPost.formato}</span>
                )}
                {selectedPost.estado && (
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", border: "1px solid #dbdbdb", color: "#555" }}>{selectedPost.estado}</span>
                )}
              </div>
              <p style={{ fontSize: "13px", color: "#111", margin: 0, lineHeight: 1.4 }}>{selectedPost.title}</p>
            </div>

            {/* Navegación */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px 14px" }}>
              <button
                onClick={() => {
                  const idx = filtered.indexOf(selectedPost);
                  if (idx > 0) setSelectedPost(filtered[idx - 1]);
                }}
                disabled={filtered.indexOf(selectedPost) === 0}
                style={{ background: "none", border: "1px solid #dbdbdb", borderRadius: "99px", padding: "5px 14px", fontSize: "12px", cursor: "pointer", color: "#333" }}
              >
                ← Anterior
              </button>
              <button
                onClick={() => {
                  const idx = filtered.indexOf(selectedPost);
                  if (idx < filtered.length - 1) setSelectedPost(filtered[idx + 1]);
                }}
                disabled={filtered.indexOf(selectedPost) === filtered.length - 1}
                style={{ background: "none", border: "1px solid #dbdbdb", borderRadius: "99px", padding: "5px 14px", fontSize: "12px", cursor: "pointer", color: "#333" }}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}