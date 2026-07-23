import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const getSchema = z.object({ token: z.string().uuid() });
const submitSchema = z.object({
  token: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(600),
  author_name: z.string().trim().min(1).max(80),
  city: z.string().trim().max(80).optional().default(""),
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/reviews")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }
        const action = (body as { action?: string })?.action;
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        if (action === "get") {
          const parsed = getSchema.safeParse(body);
          if (!parsed.success) return json({ error: "Invalid input" }, 400);
          const { data, error } = await supabaseAdmin.rpc(
            "get_reservation_for_review",
            { _token: parsed.data.token },
          );
          if (error) return json({ error: error.message }, 400);
          const row = Array.isArray(data) ? data[0] ?? null : data;
          return json({ data: row });
        }

        if (action === "submit") {
          const parsed = submitSchema.safeParse(body);
          if (!parsed.success) return json({ error: "Invalid input" }, 400);
          const { data, error } = await supabaseAdmin.rpc("submit_review", {
            _token: parsed.data.token,
            _rating: parsed.data.rating,
            _comment: parsed.data.comment,
            _author_name: parsed.data.author_name,
            _city: parsed.data.city,
          });
          if (error) return json({ error: error.message }, 400);
          return json({ data });
        }

        return json({ error: "Unknown action" }, 400);
      },
    },
  },
});