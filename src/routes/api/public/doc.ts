import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/doc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("t") ?? "";
        const kind = url.searchParams.get("k") ?? "";
        if (!/^[0-9a-f-]{36}$/i.test(token) || (kind !== "cin" && kind !== "permis")) {
          return new Response("Bad request", { status: 400 });
        }
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data, error } = await supabaseAdmin
          .from("reservations")
          .select("cin_url, permis_url")
          .eq("review_token", token)
          .maybeSingle();
        if (error || !data) return new Response("Not found", { status: 404 });
        const stored = kind === "cin" ? data.cin_url : data.permis_url;
        if (!stored) return new Response("Not found", { status: 404 });
        // Extract storage path from stored value (either a signed URL or a raw path)
        let path = stored;
        const marker = "/reservation-docs/";
        const idx = stored.indexOf(marker);
        if (idx !== -1) {
          path = stored.slice(idx + marker.length).split("?")[0];
        }
        const { data: signed, error: sErr } = await supabaseAdmin.storage
          .from("reservation-docs")
          .createSignedUrl(path, 60 * 10);
        if (sErr || !signed?.signedUrl) {
          return new Response("Unavailable", { status: 500 });
        }
        return new Response(null, {
          status: 302,
          headers: { location: signed.signedUrl },
        });
      },
    },
  },
});