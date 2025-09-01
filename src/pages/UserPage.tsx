import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const UserPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [description, setDescription] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, email, institution, municipality, created_at, profile_picture, description')
          .eq('id', user.id)
          .single();
        setProfile(data);
        setDescription(data?.description || '');
        setProfilePicture(data?.profile_picture || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleEdit = () => {
    setEditMode(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setDescription(profile?.description || '');
    setProfilePicture(profile?.profile_picture || '');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);
    setSuccessMsg('');
    setErrorMsg('');
    let newProfilePic = profilePicture;
    // Si hay un archivo nuevo seleccionado
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
      const file = fileInputRef.current.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `profile_pictures/${user.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) {
        setErrorMsg('Error al subir la foto de perfil.');
        setUploading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      newProfilePic = publicUrlData.publicUrl + '?t=' + new Date().getTime();
    }
    // Actualizar en la base de datos
    const { error } = await supabase
      .from('users')
      .update({ description, profile_picture: newProfilePic })
      .eq('id', user.id);
    if (error) {
      setErrorMsg('Error al guardar los cambios.');
    } else {
      setProfile({ ...profile, description, profile_picture: newProfilePic });
      setSuccessMsg('¡Perfil actualizado correctamente!');
      setEditMode(false);
    }
    setUploading(false);
  };

  if (loading) return <div className="text-center text-white py-10">Cargando...</div>;
  if (!profile) return <div className="text-center text-red-400 py-10">No se pudo cargar el perfil.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12 w-full max-w-lg flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <img
            src={profile.profile_picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.full_name)}
            alt="Foto de perfil"
            className="w-28 h-28 rounded-full object-cover border-4 border-purple-400 shadow-lg mb-3"
          />
          <h2 className="text-2xl font-bold text-white mb-1">{profile.full_name}</h2>
          <p className="text-blue-200 text-sm">{profile.email}</p>
        </div>
        <div className="w-full space-y-2 mb-6">
          <div className="flex justify-between text-blue-100">
            <span className="font-semibold">Institución:</span>
            <span>{profile.institution}</span>
          </div>
          <div className="flex justify-between text-blue-100">
            <span className="font-semibold">Municipio:</span>
            <span>{profile.municipality}</span>
          </div>
          <div className="flex justify-between text-blue-100">
            <span className="font-semibold">Fecha de creación:</span>
            <span>{new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        {/* Modo edición */}
        {editMode ? (
          <form className="w-full" onSubmit={handleSave}>
            <div className="mb-4">
              <label className="block text-purple-200 font-semibold mb-1">Descripción:</label>
              <textarea
                className="w-full bg-white/10 rounded-lg p-3 text-blue-100 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={300}
              />
            </div>
            <div className="mb-4">
              <label className="block text-purple-200 font-semibold mb-1">Foto de perfil:</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="block w-full text-blue-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-60"
                disabled={uploading}
              >
                {uploading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {errorMsg && <div className="text-red-400 mt-2 text-center">{errorMsg}</div>}
            {successMsg && <div className="text-green-400 mt-2 text-center">{successMsg}</div>}
          </form>
        ) : (
          <>
            <div className="w-full mb-6">
              <label className="block text-purple-200 font-semibold mb-1">Descripción:</label>
              <div className="bg-white/10 rounded-lg p-3 text-blue-100 min-h-[60px]">
                {profile.description || <span className="italic text-blue-300">Sin descripción</span>}
              </div>
            </div>
            <button className="mt-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all" onClick={handleEdit}>
              Editar perfil
            </button>
            {errorMsg && <div className="text-red-400 mt-2 text-center">{errorMsg}</div>}
            {successMsg && <div className="text-green-400 mt-2 text-center">{successMsg}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default UserPage; 