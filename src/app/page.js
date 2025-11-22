"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);


  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error fetching posts:", errorData);
        setPosts([]);
        return;
      }
      const data = await res.json();
      console.log("POSTS DATA:", data);
      // Log para verificar las URLs de las imágenes
      data.forEach(post => {
        console.log(`Post ${post.id} - imageUrl:`, post.imageUrl);
      });
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error en fetchPosts:", error);
      setPosts([]);
    }
  }


 async function updatePost() {
  // Validar campos obligatorios
  const newErrors = {};
  if (!editTitle.trim()) {
    newErrors.title = "El título es obligatorio";
  }
  if (!editContent.trim()) {
    newErrors.content = "El contenido es obligatorio";
  }

  if (Object.keys(newErrors).length > 0) {
    setEditErrors(newErrors);
    return;
  }

  setEditErrors({});

  try {
    let imageUrl = selectedPost.imageUrl; // Mantener la imagen actual por defecto

    if (editImage) {
      const fileData = new FormData();
      fileData.append("file", editImage);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: fileData,
      });

      if (!uploadRes.ok) {
        console.error("Error subiendo imagen");
        return;
      }

      const uploaded = await uploadRes.json();
      imageUrl = uploaded.url;
      console.log("URL de imagen subida:", imageUrl);
    }

    const postData = new FormData();
    postData.append("title", editTitle);
    postData.append("content", editContent);
    postData.append("imageUrl", imageUrl);

    const res = await fetch(`/api/posts/${selectedPost.id}`, {
      method: "PUT",
      body: postData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error actualizando post:", errorData);
      return;
    }

    const updatedPost = await res.json();
    console.log("Post actualizado:", updatedPost);

    setEditTitle("");
    setEditContent("");
    setEditImage(null);
    setEditErrors({});
    setIsEditModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedPost(null);
    await fetchPosts();
  } catch (error) {
    console.error("Error en updatePost:", error);
  }
}

 async function createPost() {
  // Validar campos obligatorios
  const newErrors = {};
  if (!title.trim()) {
    newErrors.title = "El título es obligatorio";
  }
  if (!content.trim()) {
    newErrors.content = "El contenido es obligatorio";
  }
  if (!image) {
    newErrors.image = "La imagen es obligatoria";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});

  try {
    let imageUrl = "";

    if (image) {
      const fileData = new FormData();
      fileData.append("file", image);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: fileData,
      });

      if (!uploadRes.ok) {
        console.error("Error subiendo imagen");
        return;
      }

      const uploaded = await uploadRes.json();
      imageUrl = uploaded.url;
      console.log("URL de imagen subida:", imageUrl);
    }

    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("imageUrl", imageUrl);

    const res = await fetch("/api/posts", {
      method: "POST",
      body: postData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error creando post:", errorData);
      return;
    }

    const newPost = await res.json();
    console.log("Post creado:", newPost);

    setTitle("");
    setContent("");
    setImage(null);
    setErrors({});
    setIsModalOpen(false);
    await fetchPosts();
  } catch (error) {
    console.error("Error en createPost:", error);
  }
}


  return (
    <main className="min-h-screen w-full p-6" style={{ backgroundColor: '#2B2D42' }}>
      <header className="mb-6 md:relative">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-3xl font-bold italic hover:cursor-pointer" onClick={() => location.reload()} style={{ color: '#FFF8F0' }}>Show-It </h1> 
          <svg className="cursor-pointer" onClick={() => location.reload()} xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#FFF8F0"><path d="m136-240-56-56 212-212q35-35 85-35t85 35l46 46q12 12 28.5 12t28.5-12l178-178H640v-80h240v240h-80v-103L621-405q-35 35-85 35t-85-35l-47-47q-11-11-28-11t-28 11L136-240Z"/></svg>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="flex justify-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:top-0 md:w-full md:max-w-md">
          <input
            type="text"
            placeholder="Buscar publicaciones..."
            className="w-full max-w-md px-6 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ 
              borderColor: '#4D7C8A', 
              backgroundColor: '#FFF8F0', 
              color: '#2B2D42',
              '--tw-ring-color': '#4D7C8A'
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>
        <button
          className="px-4 py-2 rounded-full text-white hover:animate-pop cursor-pointer absolute bottom-4 right-4"
          style={{ backgroundColor: '#4D7C8A' }}
          onClick={() => setIsModalOpen(true)}
        >
          <span className="text-2xl">+</span>
        </button>
        

      {/* Modal de detalles */}
      {isDetailModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center animate-fade-in animate-duration-300 z-50 p-4">
          <div className="p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#FFF8F0' }}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold" style={{ color: '#2B2D42' }}>{selectedPost.title}</h2>
              <button
                className="text-2xl font-bold hover:animate-pop cursor-pointer"
                style={{ color: '#4D7C8A' }}
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedPost(null);
                }}
              >
                ×
              </button>
            </div>

            {selectedPost.imageUrl && selectedPost.imageUrl.trim() !== "" ? (
              <div className="w-full flex justify-center mb-4">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title || "Imagen de publicación"}
                  className="max-w-full h-auto max-h-[70vh] object-contain rounded-md"
                  onError={(e) => {
                    console.error("Error cargando imagen:", selectedPost.imageUrl);
                    e.target.src = "https://via.placeholder.com/300";
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-64 rounded-md flex items-center justify-center mb-4" style={{ backgroundColor: '#2B2D42' }}>
                <span style={{ color: '#FFF8F0' }}>Sin imagen</span>
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2B2D42' }}>Contenido:</h3>
              <p className="whitespace-pre-wrap" style={{ color: '#2B2D42' }}>{selectedPost.content}</p>
            </div>

            {selectedPost.createdAt && (
              <div className="text-sm mb-4" style={{ color: '#4D7C8A' }}>
                Publicado: {new Date(selectedPost.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}

            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 text-white rounded hover:animate-pop cursor-pointer"
                style={{ backgroundColor: '#4D7C8A' }}
                onClick={() => {
                  setIsDeleteConfirmOpen(true);
                }}
              >
                Eliminar
              </button>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 text-white rounded hover:animate-pop cursor-pointer"
                  style={{ backgroundColor: '#4D7C8A' }}
                  onClick={() => {
                    setEditTitle(selectedPost.title);
                    setEditContent(selectedPost.content);
                    setEditImage(null);
                    setEditErrors({});
                    setIsEditModalOpen(true);
                  }}
                >
                  Editar
                </button>
                <button
                  className="px-4 py-2 text-white rounded hover:animate-pop cursor-pointer"
                  style={{ backgroundColor: '#4D7C8A' }}
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedPost(null);
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteConfirmOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center animate-fade-in animate-duration-300 z-[60]">
          <div className="p-6 rounded-lg shadow-xl w-full max-w-md" style={{ backgroundColor: '#FFF8F0' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#2B2D42' }}>Confirmar eliminación</h2>
            <p className="mb-6" style={{ color: '#2B2D42' }}>
              ¿Estás seguro de que quieres eliminar la publicación <strong>"{selectedPost.title}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-white rounded hover:animate-pop cursor-pointer"
                style={{ backgroundColor: '#2B2D42' }}
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-white rounded hover:animate-pop cursor-pointer"
                style={{ backgroundColor: '#4D7C8A' }}
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/posts/${selectedPost.id}`, {
                      method: "DELETE",
                    });
                    if (res.ok) {
                      setIsDeleteConfirmOpen(false);
                      setIsDetailModalOpen(false);
                      setSelectedPost(null);
                      await fetchPosts();
                    } else {
                      const errorData = await res.json();
                      alert("Error al eliminar la publicación: " + (errorData.error || "Error desconocido"));
                    }
                  } catch (error) {
                    console.error("Error eliminando post:", error);
                    alert("Error al eliminar la publicación");
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {isEditModalOpen && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center animate-fade-in animate-duration-300 z-50">
          <div className="p-6 rounded-lg shadow-xl w-full max-w-md" style={{ backgroundColor: '#FFF8F0' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#2B2D42' }}>Editar publicación</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: '#2B2D42' }}>
                Título <span style={{ color: '#4D7C8A' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Título"
                className={`w-full border p-2 rounded ${editErrors.title ? 'border-red-500' : ''}`}
                style={{ 
                  borderColor: editErrors.title ? '#ef4444' : '#4D7C8A',
                  backgroundColor: '#FFF8F0',
                  color: '#2B2D42'
                }}
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  if (editErrors.title) setEditErrors({...editErrors, title: null});
                }}
                required
              />
              {editErrors.title && <p className="text-red-500 text-xs mt-1">{editErrors.title}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: '#2B2D42' }}>
                Contenido <span style={{ color: '#4D7C8A' }}>*</span>
              </label>
              <textarea
                placeholder="Contenido"
                className={`w-full border p-2 rounded ${editErrors.content ? 'border-red-500' : ''}`}
                style={{ 
                  borderColor: editErrors.content ? '#ef4444' : '#4D7C8A',
                  backgroundColor: '#FFF8F0',
                  color: '#2B2D42'
                }}
                rows="3"
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  if (editErrors.content) setEditErrors({...editErrors, content: null});
                }}
                required
              ></textarea>
              {editErrors.content && <p className="text-red-500 text-xs mt-1">{editErrors.content}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: '#2B2D42' }}>
                Imagen (opcional - dejar vacío para mantener la actual)
              </label>
              <div className="border p-2 rounded" style={{ borderColor: '#4D7C8A' }}>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="edit-image-input"
                    onChange={(e) => {
                      setEditImage(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-image-input"
                    className="px-2 py-1 text-white rounded hover:animate-pop cursor-pointer text-xs"
                    style={{ backgroundColor: '#4D7C8A' }}
                  >
                    Añadir imagen
                  </label>
                  {editImage && (
                    <span className="text-sm" style={{ color: '#2B2D42' }}>{editImage.name}</span>
                  )}
                  {!editImage && selectedPost.imageUrl && (
                    <span className="text-xs" style={{ color: '#4D7C8A' }}>
                      Imagen actual: {selectedPost.imageUrl.substring(0, 30)}...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 text-white rounded hover:animate-pop cursor-pointer"
                style={{ backgroundColor: '#2B2D42' }}
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditErrors({});
                  setEditTitle("");
                  setEditContent("");
                  setEditImage(null);
                }}
              >
                Cancelar
              </button>

              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 hover:animate-pop cursor-pointer"
                onClick={updatePost}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center animate-fade-in animate-duration-300 z-40">
          <div className="p-6 rounded-lg shadow-xl w-full max-w-md" style={{ backgroundColor: '#FFF8F0' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#2B2D42' }}>Nueva publicación</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: '#2B2D42' }}>
                Título <span style={{ color: '#4D7C8A' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Título"
                className={`w-full border p-2 rounded ${errors.title ? 'border-red-500' : ''}`}
                style={{ 
                  borderColor: errors.title ? '#ef4444' : '#4D7C8A',
                  backgroundColor: '#FFF8F0',
                  color: '#2B2D42'
                }}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({...errors, title: null});
                }}
                required
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: '#2B2D42' }}>
                Contenido <span style={{ color: '#4D7C8A' }}>*</span>
              </label>
              <textarea
                placeholder="Contenido"
                className={`w-full border p-2 rounded ${errors.content ? 'border-red-500' : ''}`}
                style={{ 
                  borderColor: errors.content ? '#ef4444' : '#4D7C8A',
                  backgroundColor: '#FFF8F0',
                  color: '#2B2D42'
                }}
                rows="3"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors({...errors, content: null});
                }}
                required
              ></textarea>
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: '#2B2D42' }}>
                Imagen <span style={{ color: '#4D7C8A' }}>*</span>
              </label>
              <div className="border p-2 rounded" style={{ borderColor: '#4D7C8A' }}>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="create-image-input"
                    onChange={(e) => {
                      setImage(e.target.files[0]);
                      if (errors.image) setErrors({...errors, image: null});
                    }}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="create-image-input"
                    className={`px-2 py-1 text-white rounded hover:cursor-pointer text-xs ${errors.image ? 'border-2 border-red-500' : ''}`}
                    style={{ backgroundColor: '#4D7C8A' }}
                  >
                    Añadir imagen
                  </label>
                  {image && (
                    <span className="text-sm" style={{ color: '#2B2D42' }}>{image.name}</span>
                  )}
                </div>
              </div>
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 text-white rounded hover:animate-pop cursor-pointer"
                style={{ backgroundColor: '#2B2D42' }}
                onClick={() => {
                  setIsModalOpen(false);
                  setErrors({});
                  setTitle("");
                  setContent("");
                  setImage(null);
                }}
              >
                Cancelar
              </button>

              <button
                className="px-4 py-2 text-white rounded hover:animate-pop cursor-pointer"
                style={{ backgroundColor: '#4D7C8A' }}
                onClick={createPost}
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de publicaciones */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 auto-rows-auto">
        {posts
          .filter((post) => {
            const query = searchQuery.toLowerCase();
            return (
              post.title?.toLowerCase().includes(query) ||
              post.content?.toLowerCase().includes(query)
            );
          })
          .map((post, index) => (
          <div 
            key={post.id} 
            className={`shadow rounded-lg p-3 hover:animate-pop cursor-pointer flex flex-col`}
            style={{
              backgroundColor: '#FFF8F0',
            }}
            onClick={() => {
              setSelectedPost(post);
              setIsDetailModalOpen(true);
            }}
          >
            {post.imageUrl && post.imageUrl.trim() !== "" ? (
              <div className="w-full flex justify-center items-start">
                <img
                  src={post.imageUrl}
                  alt={post.title || "Imagen de publicación"}
                  className="rounded-md w-full h-auto object-contain max-h-[600px]"
                  onError={(e) => {
                    console.error("Error cargando imagen:", post.imageUrl);
                    e.target.src = "https://via.placeholder.com/300";
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-40 rounded-md flex items-center justify-center" style={{ backgroundColor: '#2B2D42' }}>
                <span style={{ color: '#FFF8F0' }}>Sin imagen</span>
              </div>
            )}
            <h3 className="mt-2 text-lg font-semibold" style={{ color: '#2B2D42' }}>{post.title}</h3>
          </div>
        ))}
      </section>
    </main>
  );
}
