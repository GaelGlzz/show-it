import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const imageUrl = formData.get("imageUrl") || "";

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || "https://via.placeholder.com/300",
      },
    });

    return NextResponse.json(newPost);
  } catch (error) {
    console.error("Error creando post:", error);
    return NextResponse.json({ error: "Error creando post", details: error.message }, { status: 500 });
  }
}


export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error en GET /api/posts:", error);
    return NextResponse.json({ error: "Error al obtener posts", details: error.message }, { status: 500 });
  }
}
