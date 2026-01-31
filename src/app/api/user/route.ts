// src/app/api/user/route.ts
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json({
    user: session.user
  });
}

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const {data} = body

  if(!data) {
    return Response.json(
        { error: "data is a required property"},
        { status: 400 }
      );
  }
  
  const updatedUser = await auth.api.updateUser({
    body: data,
    headers: req.headers
  });

  return Response.json(updatedUser);
}
