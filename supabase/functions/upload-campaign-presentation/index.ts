import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Verify admin
    const { data: adminRow, error: adminError } = await adminClient
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !adminRow) {
      return new Response(
        JSON.stringify({ error: "Acceso denegado: no es administrador" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Determine request type based on Content-Type
    const contentType = req.headers.get("content-type") || "";
    const isFormData = contentType.includes("multipart/form-data");

    if (!isFormData) {
      // JSON request — handle sign / delete actions
      const body = await req.json();
      const action = body.action as string;
      const path = body.path as string;

      if (!action || !path) {
        return new Response(
          JSON.stringify({ error: "Faltan campos: action, path" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (action === "sign") {
        const bucket = body.bucket as string || "campaign-presentations";
        const allowedSignBuckets = ["campaign-presentations", "market-studies"];
        if (!allowedSignBuckets.includes(bucket)) {
          return new Response(
            JSON.stringify({ error: `Bucket no permitido: ${bucket}` }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        const { data, error } = await adminClient.storage
          .from(bucket)
          .createSignedUrl(path, 3600);

        if (error) {
          console.error("[upload-campaign-presentation] Sign error:", error.message);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({ signedUrl: data.signedUrl }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (action === "download_blob") {
        const bucket = body.bucket as string || "campaign-presentations";
        const allowedDownloadBuckets = ["campaign-presentations", "market-studies"];
        if (!allowedDownloadBuckets.includes(bucket)) {
          return new Response(
            JSON.stringify({ error: `Bucket no permitido: ${bucket}` }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        const { data: fileData, error: dlError } = await adminClient.storage
          .from(bucket)
          .download(path);

        if (dlError || !fileData) {
          console.error("[upload-campaign-presentation] download_blob error:", dlError?.message);
          return new Response(
            JSON.stringify({ error: dlError?.message || "No se pudo descargar" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        const ext = path.split('.').pop()?.toLowerCase() || '';
        const mimeMap: Record<string, string> = {
          pdf: 'application/pdf',
          ppt: 'application/vnd.ms-powerpoint',
          pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        };
        const contentType = mimeMap[ext] || 'application/octet-stream';

        return new Response(fileData, {
          headers: {
            ...corsHeaders,
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${body.fileName || path}"`,
          },
        });
      }

      if (action === "delete") {
        const { error } = await adminClient.storage
          .from("campaign-presentations")
          .remove([path]);

        if (error) {
          console.error("[upload-campaign-presentation] Delete error:", error.message);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (action === "upload_blob") {
        const bucket = body.bucket as string;
        const base64 = body.base64 as string;
        const allowedBuckets = ["campaign-presentations", "valuations", "market-studies"];

        if (!bucket || !base64) {
          return new Response(
            JSON.stringify({ error: "Faltan campos: bucket, base64" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        if (!allowedBuckets.includes(bucket)) {
          return new Response(
            JSON.stringify({ error: `Bucket no permitido: ${bucket}` }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        // Decode base64 to Uint8Array
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const { data: uploadData, error: uploadBlobError } = await adminClient.storage
          .from(bucket)
          .upload(path, bytes, {
            upsert: true,
            contentType: "application/pdf",
          });

        if (uploadBlobError) {
          console.error("[upload-campaign-presentation] upload_blob error:", uploadBlobError.message);
          return new Response(
            JSON.stringify({ error: uploadBlobError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({ success: true, path: uploadData.path }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (action === "copy") {
        const destinationPath = body.destinationPath as string;
        if (!destinationPath) {
          return new Response(
            JSON.stringify({ error: "Falta campo: destinationPath" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        // Download original file
        const { data: fileData, error: downloadError } = await adminClient.storage
          .from("campaign-presentations")
          .download(path);

        if (downloadError || !fileData) {
          console.error("[upload-campaign-presentation] Copy download error:", downloadError?.message);
          return new Response(
            JSON.stringify({ error: downloadError?.message || "No se pudo descargar el archivo" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        // Upload to new path
        const { data: uploadData, error: uploadCopyError } = await adminClient.storage
          .from("campaign-presentations")
          .upload(destinationPath, fileData, {
            upsert: true,
            contentType: "application/pdf",
          });

        if (uploadCopyError) {
          console.error("[upload-campaign-presentation] Copy upload error:", uploadCopyError.message);
          return new Response(
            JSON.stringify({ error: uploadCopyError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({ success: true, path: uploadData.path }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ error: `Acción no soportada: ${action}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4. FormData request — handle file upload
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const storagePath = formData.get("storagePath") as string | null;

    if (!file || !storagePath) {
      return new Response(
        JSON.stringify({ error: "Faltan campos: file, storagePath" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data, error: uploadError } = await adminClient.storage
      .from("campaign-presentations")
      .upload(storagePath, file, {
        upsert: true,
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error("[upload-campaign-presentation] Storage error:", uploadError.message);
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ path: data.path }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[upload-campaign-presentation] Unhandled error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
