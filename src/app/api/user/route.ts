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

  // Validate that only allowed fields are being updated
  const allowedFields = ['name', 'phase'];
  const updateData: Record<string, any> = {};

  for (const key of Object.keys(data)) {
    if (allowedFields.includes(key)) {
      updateData[key] = data[key];
    } else if (key === 'pregnancyId') {
      // pregnancyId can only be set to null
      if (data[key] !== null) {
        return Response.json(
          { error: "pregnancyId cannot be updated" },
          { status: 400 }
        );
      }
      updateData[key] = null;
    } else {
      return Response.json(
        { error: `Field '${key}' cannot be updated` },
        { status: 400 }
      );
    }
  }
  
  const updatedUser = await auth.api.updateUser({
    body: updateData,
    headers: req.headers
  });

  return Response.json(updatedUser);
}
