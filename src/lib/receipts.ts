import { createClient } from "@/lib/supabase/client";

// Uploads a receipt image to Supabase Storage and returns its public URL.
export async function uploadReceipt(file: File): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const path = `${user.id}/${fileName}`;

  const { error } = await supabase.storage.from("receipts").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Receipt upload failed:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("receipts").getPublicUrl(path);
  return data.publicUrl;
}