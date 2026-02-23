import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  user_id: string;
  nombre: string;
  cargo: string;
  email_contacto: string;
  numero: string;
  foto_url: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setProfile(data as Profile | null);
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);
    if (!error) await fetchProfile();
    return error;
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return null;
    const path = `${user.id}/avatar.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true });
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(path);
    await updateProfile({ foto_url: publicUrl });
    return publicUrl;
  };

  return { profile, loading, updateProfile, uploadPhoto, refetch: fetchProfile };
}
