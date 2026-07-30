"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "./types";

export function useProfile() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      setLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile({
        id: data.id,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        email: user.email ?? null,
      });
    } else {
      setProfile({
        id: user.id,
        fullName: null,
        avatarUrl: null,
        email: user.email ?? null,
      });
    }
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: { fullName?: string; avatarUrl?: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: updates.fullName,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (!error) {
        await fetchProfile();
      }
    },
    [supabase, fetchProfile],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) return null;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      // Cache-bust so the new image shows immediately
      const bustedUrl = `${publicUrl}?t=${Date.now()}`;
      await updateProfile({ avatarUrl: bustedUrl });
      return bustedUrl;
    },
    [supabase, updateProfile],
  );

  return { profile, updateProfile, uploadAvatar, loaded };
}