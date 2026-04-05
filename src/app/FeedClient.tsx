"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  nombre: string;
  imgUrl: string | null;
  contenido: string[];
  formato: string;
  estado: string;
  copy: string;
  fecha: string;
  pinned: boolean;
};

function isVideo(url: string) {
  return url.match(/\.(mp4|mov|webm|ogg)(\?|$)/i) !== null;
}

function formatFecha(fecha: string) {
  if (!fecha) return "";
  const d = new Date(fecha + "T12:00:00");
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export default function FeedClient({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState("todos");
  const [showBio, setShowBio] = useState(true);
  const [showOptions, setShowOptions] = useState(false);
  const [vista, setVista] = useState<"feed" | "organizar">("feed");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [dragOrder, setDragOrder] = useState<Post[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragOverId = useRef<string | null>(null);
  const router = useRouter();

  const filtered = posts.filter((p) => {
    if (filter === "todos") return true;
    if (filter === "publicado") return p.estado?.toLowerCase().includes("publicad");
    return true;
  });

  const currentPosts = vista === "feed" ? filtered : (dragOrder.length > 0 ? dragOrder : [...filtered]);

  function handleRefresh() {
    startTransition(() => { router.refresh(); });
  }

  function switchToOrganize() {
    setDragOrder([...filtered]);
    setVista("organizar");
    setShowOptions(false);
  }

  function onDragStart(id: string) { setDraggedId(id); }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); dragOverId.current = id; }
  function onDrop() {
    if (!draggedId || !dragOverId.current || draggedId === dragOverId.current) return;
    const newOrder = [...currentPosts];
    const fromIdx = newOrder.findIndex(p => p.id === draggedId);
    const toIdx = newOrder.findIndex(p => p.id === dragOverId.current);
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    setDragOrder(newOrder);
    setDraggedId(null);
    dragOverId.current = null;
  }

  const slides = selectedPost
    ? selectedPost.contenido.length > 0
      ? selectedPost.contenido
      : selectedPost.imgUrl ? [selectedPost.imgUrl] : []
    : [];

  return (
    <>
      {showBio && (
        <div style={{ padding: "16px 16px 10px" }}>
          <p style={{ fontWeight: 700, fontSize: "15px", margin: "0 0 2px" }}>@rey_de_copas</p>
          <p style={{ fontWeight: 600, fontSize: "13px", margin: "0 0 2px", color: "#111" }}>Rey de Copas · Bar</p>
          <p style={{ fontSize: "13px", color: "#333", margin: 0, lineHeight: 1.4 }}>Calendario de contenido ✦ Feed preview</p>
        </div>
      )}

      <div style={{ borderTop: "1px solid #dbdbdb" }} />

      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", borderBottom: "1px solid #dbdbdb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", borderBottom: "2px solid #111", paddingBottom: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#111", letterSpacing: "0.5px", textTransform: "uppercase" }}>Posts</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderBottom: "1px solid #dbdbdb", position: "relative" }}>
        <button onClick={() => { setVista("feed"); setShowOptions(false); }} style={{ padding: "5px 12px", borderRadius: "99px", border: "1px solid", borderColor: vista === "feed" ? "#111" : "#dbdbdb", background: vista === "feed" ? "#111" : "transparent", color: vista === "feed" ? "#fff" : "#333", fontSize: "12px", cursor: "pointer", fontWeight: vista === "feed" ? 600 : 400 }}>Feed</button>
        <button onClick={switchToOrganize} style={{ padding: "5px 12px", borderRadius: "99px", border: "1px solid", borderColor: vista === "organizar" ? "#111" : "#dbdbdb", background: vista === "organizar" ? "#111" : "transparent", color: vista === "organizar" ? "#fff" : "#333", fontSize: "12px", cursor: "pointer", fontWeight: vista === "organizar" ? 600 : 400 }}>✥ Organizar</button>

        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          <button onClick={handleRefresh} disabled={isPending} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #dbdbdb", background: "transparent", cursor: isPending ? "wait" : "pointer", fontSize: "14px", color: isPending ? "#bbb" : "#333" }}>↻</button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowOptions(!showOptions)} style={{ width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #dbdbdb", background: "transparent", cursor: "pointer", fontSize: "16px", color: "#333" }}>⋯</button>
            {showOptions && (
              <div style={{ position: "absolute", right: 0, top: "36px", background: "#fff", border: "1px solid #dbdbdb", borderRadius: "12px", padding: "8px 0", minWidth: "180px", zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <div onClick={() => { setShowBio(!showBio); setShowOptions(false); }} style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", color: "#111" }}>{showBio ? "Ocultar bio" : "Mostrar bio"}</div>
                <div style={{ borderTop: "1px solid #f0f0f0", margin: "4px 0" }} />
                <div style={{ padding: "4px 16px", fontSize: "11px", color: "#888" }}>Filtrar por</div>
                {[{ key: "todos", label: "Todos" }, { key: "publicado", label: "Publicados" }].map((f) => (
                  <div key={f.key} onClick={() => { setFilter(f.key); setShowOptions(false); }} style={{ padding: "8px 16px", fontSize: "13px", cursor: "pointer", color: "#111", fontWeight: filter === f.key ? 600 : 400, display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: filter === f.key ? "#111" : "transparent", border: "1px solid #ccc", display: "inline-block" }} />
                    {f.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {vista === "organizar" && (
        <div style={{ padding: "8px 16px", background: "#fffbe6", borderBottom: "1px solid #f5e68a", fontSize: "12px", color: "#8a6d00" }}>
          ✥ Arrastrá los posts para reorganizar
        </div>
      )}

      <div style={{ padding: "6px 16px", fontSize: "11px", color: "#888" }}>{currentPosts.length} posts</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
        {currentPosts.map((post) => (
          <div key={post.id}
            draggable={vista === "organizar"}
            onDragStart={() => onDragStart(post.id)}
            onDragOver={(e) => onDragOver(e, post.id)}
            onDrop={onDrop}
            onMouseEnter={() => setHoveredId(post.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => vista === "feed" && (setSelectedPost(post), setSlideIndex(0))}
            style={{ aspectRatio: "4/5", position: "relative", overflow: "hidden", background: "#f0f0f0", cursor: vista === "organizar" ? "grab" : "pointer", opacity: draggedId === post.id ? 0.4 : 1 }}
          >
            {post.imgUrl ? (
              isVideo(post.imgUrl) ? (
                <video src={post.imgUrl} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} muted playsInline />
              ) : (
                <img src={post.imgUrl} alt={post.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            )}

            {hoveredId === post.id && vista === "feed" && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "8px" }}>
                <p style={{ color: "white", fontSize: "11px", fontWeight: 600, margin: "0 0 2px", lineHeight: 1.3 }}>{post.nombre}</p>
                {post.fecha && <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "10px", margin: 0 }}>{formatFecha(post.fecha)}</p>}
              </div>
            )}

            {post.pinned && <div style={{ position: "absolute", top: "5px", left: "5px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg></div>}
            {post.formato === "Reel/Tiktok" && <div style={{ position: "absolute", top: "5px", right: "5px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg></div>}
            {post.formato === "Carrusel" && <div style={{ position: "absolute", top: "5px", right: "5px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="6" width="5" height="12" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/><rect x="17" y="6" width="5" height="12" rx="1"/></svg></div>}
            {vista === "organizar" && (
              <div style={{ position: "absolute", top: "5px", left: "5px", background: "rgba(0,0,0,0.5)", borderRadius: "4px", padding: "2px 4px" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><circle cx="2" cy="2" r="1"/><circle cx="8" cy="2" r="1"/><circle cx="2" cy="5" r="1"/><circle cx="8" cy="5" r="1"/><circle cx="2" cy="8" r="1"/><circle cx="8" cy="8" r="1"/></svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedPost && (
        <div onClick={() => setSelectedPost(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "16px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "12px", width: "min(380px, 95vw)", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #dbdbdb", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "white", fontSize: "10px", fontWeight: 700 }}>RC</span>
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, margin: 0 }}>rey_de_copas</p>
                  {selectedPost.fecha && <p style={{ fontSize: "11px", color: "#888", margin: 0 }}>{formatFecha(selectedPost.fecha)}</p>}
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#333" }}>×</button>
            </div>

            {/* Media */}
            <div style={{ position: "relative", background: "#000" }}>
              {slides.length > 0 ? (
                isVideo(slides[slideIndex]) ? (
                  <video
                    key={slides[slideIndex]}
                    src={slides[slideIndex]}
                    style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }}
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img src={slides[slideIndex]} alt={selectedPost.nombre} style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }} />
                )
              ) : (
                <div style={{ width: "100%", aspectRatio: "4/5", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#555", fontSize: "13px" }}>Sin imagen</span>
                </div>
              )}

              {/* Contador estilo IG */}
              {slides.length > 1 && (
                <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.55)", color: "white", fontSize: "12px", fontWeight: 600, padding: "3px 8px", borderRadius: "99px" }}>
                  {slideIndex + 1}/{slides.length}
                </div>
              )}

              {/* Flechas */}
              {slides.length > 1 && (
                <>
                  <button onClick={() => setSlideIndex(i => Math.max(0, i - 1))} disabled={slideIndex === 0}
                    style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", opacity: slideIndex === 0 ? 0.3 : 1 }}>‹</button>
                  <button onClick={() => setSlideIndex(i => Math.min(slides.length - 1, i + 1))} disabled={slideIndex === slides.length - 1}
                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", opacity: slideIndex === slides.length - 1 ? 0.3 : 1 }}>›</button>
                </>
              )}

              {/* Puntos */}
              {slides.length > 1 && (
                <div style={{ position: "absolute", bottom: "10px", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "4px" }}>
                  {slides.map((_, i) => (
                    <div key={i} onClick={() => setSlideIndex(i)} style={{ width: i === slideIndex ? "8px" : "6px", height: i === slideIndex ? "8px" : "6px", borderRadius: "50%", background: i === slideIndex ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.15s" }} />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                {selectedPost.formato && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", border: "1px solid #dbdbdb", color: "#555" }}>{selectedPost.formato}</span>}
                {selectedPost.estado && <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", border: "1px solid #dbdbdb", color: "#555" }}>{selectedPost.estado}</span>}
              </div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#111", margin: "0 0 6px" }}>{selectedPost.nombre}</p>
              {selectedPost.copy && <p style={{ fontSize: "13px", color: "#333", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selectedPost.copy}</p>}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px 14px", borderTop: "1px solid #dbdbdb" }}>
              <button onClick={() => { const idx = filtered.indexOf(selectedPost); if (idx > 0) { setSelectedPost(filtered[idx - 1]); setSlideIndex(0); } }} disabled={filtered.indexOf(selectedPost) === 0}
                style={{ background: "none", border: "1px solid #dbdbdb", borderRadius: "99px", padding: "5px 14px", fontSize: "12px", cursor: "pointer", color: "#333", opacity: filtered.indexOf(selectedPost) === 0 ? 0.3 : 1 }}>← Anterior</button>
              <button onClick={() => { const idx = filtered.indexOf(selectedPost); if (idx < filtered.length - 1) { setSelectedPost(filtered[idx + 1]); setSlideIndex(0); } }} disabled={filtered.indexOf(selectedPost) === filtered.length - 1}
                style={{ background: "none", border: "1px solid #dbdbdb", borderRadius: "99px", padding: "5px 14px", fontSize: "12px", cursor: "pointer", color: "#333", opacity: filtered.indexOf(selectedPost) === filtered.length - 1 ? 0.3 : 1 }}>Siguiente →</button>
            </div>
          </div>
        </div>
      )}

      {showOptions && <div onClick={() => setShowOptions(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />}
    </>
  );
}