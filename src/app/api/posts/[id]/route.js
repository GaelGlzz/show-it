import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para extraer el public_id de una URL de Cloudinary
function extractPublicIdFromUrl(url) {
  try {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }
    
    // Extraer el public_id de la URL
    // Formato: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    // O con transformaciones: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
    // O con carpeta: https://res.cloudinary.com/{cloud_name}/image/upload/v123/{folder}/{public_id}.{format}
    
    const urlParts = url.split('/upload/');
    if (urlParts.length < 2) return null;
    
    const afterUpload = urlParts[1];
    
    // Remover la versión si existe (v1234567890/)
    let withoutVersion = afterUpload.replace(/^v\d+\//, '');
    
    // Si tiene transformaciones (w_, h_, c_, etc.), removerlas
    // Las transformaciones están antes del último segmento
    const segments = withoutVersion.split('/');
    const lastSegment = segments[segments.length - 1];
    
    // El public_id es el último segmento sin la extensión
    const publicIdWithExt = lastSegment;
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
    
    // Si hay más de un segmento, los anteriores son carpetas
    if (segments.length > 1) {
      // Filtrar segmentos que no son transformaciones (no contienen _ o números seguidos de letras)
      const folderSegments = segments.slice(0, -1).filter(seg => {
        // Las transformaciones suelen tener formato como "w_500", "c_fill", etc.
        return !seg.match(/^[a-z]_/);
      });
      
      if (folderSegments.length > 0) {
        return folderSegments.join('/') + '/' + publicId;
      }
    }
    
    return publicId;
  } catch (error) {
    console.error("Error extrayendo public_id:", error);
    return null;
  }
}

export async function DELETE(req, context) {
  try {
    let id;
    
    // Intentar obtener el id de diferentes formas según la versión de Next.js
    if (context?.params) {
      const params = context.params;
      id = params instanceof Promise ? (await params).id : params.id;
    } else {
      // Fallback: intentar desde la URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      id = pathParts[pathParts.length - 1];
    }

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    console.log("Eliminando post con ID:", id);

    // Obtener el post antes de eliminarlo para tener la URL de la imagen
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 });
    }

    // Eliminar la imagen de Cloudinary si existe
    if (post.imageUrl && post.imageUrl.includes('cloudinary.com')) {
      try {
        const publicId = extractPublicIdFromUrl(post.imageUrl);
        if (publicId) {
          console.log("Eliminando imagen de Cloudinary con public_id:", publicId);
          await cloudinary.uploader.destroy(publicId);
          console.log("Imagen eliminada de Cloudinary correctamente");
        }
      } catch (cloudinaryError) {
        console.error("Error eliminando imagen de Cloudinary:", cloudinaryError);
        // Continuar con la eliminación del post aunque falle la eliminación de la imagen
      }
    }

    // Eliminar el post de la base de datos
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Post eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando post:", error);
    return NextResponse.json(
      { error: "Error al eliminar post", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  try {
    let id;
    
    // Intentar obtener el id de diferentes formas según la versión de Next.js
    if (context?.params) {
      const params = context.params;
      id = params instanceof Promise ? (await params).id : params.id;
    } else {
      // Fallback: intentar desde la URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      id = pathParts[pathParts.length - 1];
    }

    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const imageUrl = formData.get("imageUrl");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    console.log("Actualizando post con ID:", id);

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const updateData = {
      title,
      content,
    };

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error actualizando post:", error);
    return NextResponse.json(
      { error: "Error al actualizar post", details: error.message },
      { status: 500 }
    );
  }
}

