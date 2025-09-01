import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const CHATS = [
  { category: 'Inicio', chats: ['Bienvenida', 'Reglas', 'Anuncios Oficiales', 'Novedades', 'Emergencia'] },
  { category: 'General', chats: ['Chat General', 'Sugerencias', 'Eventos', 'Reuniones'] },
  { category: 'Saber Más', chats: ['Documentos', 'Preguntas', 'Herramientas'] },
  { category: 'Salud Mental', chats: ['Desahogo Libre'] },
  { category: 'Canales Privados', chats: ['Equipo administrativo', 'Denuncias'] },
];

const MensajesPage = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático al final
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Cargar mensajes y suscribirse en tiempo real
  useEffect(() => {
    if (!selectedChat) return;
    let subscription: any;
    let ignore = false;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat', selectedChat)
        .order('created_at', { ascending: true });
      if (!ignore) setMessages(data || []);
      // Obtener usuarios únicos
      const userIds = Array.from(new Set((data || []).map((m: any) => m.user_id)));
      if (userIds.length) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, full_name, profile_picture')
          .in('id', userIds);
        const map: Record<string, any> = {};
        (usersData || []).forEach((u: any) => { map[u.id] = u; });
        setUsersMap(map);
      } else {
        setUsersMap({});
      }
    };
    fetchMessages();
    // Suscripción en tiempo real
    subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `chat=eq.${selectedChat}` }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();
    return () => {
      ignore = true;
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [selectedChat]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) {
      setError('Debes iniciar sesión para enviar mensajes.');
      return;
    }
    if (!selectedChat) {
      setError('Selecciona un chat.');
      return;
    }
    if (!message.trim()) {
      setError('El mensaje no puede estar vacío.');
      return;
    }
    setSending(true);
    const { error: dbError } = await supabase.from('messages').insert({
      chat: selectedChat,
      user_id: user.id,
      content: message.trim(),
    });
    if (dbError) {
      setError('Error al enviar el mensaje.');
    } else {
      setSuccess('Mensaje enviado.');
      setMessage('');
    }
    setSending(false);
  };

  return (
    <div className="h-screen min-h-0 w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden">
      {/* Columna izquierda (1/4) */}
      <aside className="h-full w-1/4 min-w-[220px] max-w-xs bg-white/10 border-r border-white/20 p-6 flex flex-col overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Chats</h2>
        <nav className="flex-1 space-y-6">
          {CHATS.map(({ category, chats }) => (
            <div key={category}>
              <div className="text-purple-300 font-semibold uppercase text-xs mb-2 tracking-widest">{category}</div>
              <ul className="space-y-2">
                {chats.map(chat => (
                  <li key={chat}>
                    <button
                      className={`w-full text-left text-blue-100 bg-white/10 border border-white/20 rounded-lg px-3 py-2 transition hover:bg-purple-800/40 shadow-sm ${selectedChat === chat ? 'ring-2 ring-purple-400 bg-purple-900/30' : ''}`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      {chat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      {/* Área principal (3/4) */}
      <main className="flex-1 h-full flex flex-col items-center justify-between">
        {/* Mensajes con scroll */}
        <div className="flex-1 w-full max-w-lg flex flex-col min-h-0">
          <div className="flex-1 flex flex-col gap-2 px-2 py-3 overflow-y-auto min-h-0">
            {selectedChat ? (
              <>
                <div className="text-blue-200 text-base opacity-80 mb-2 text-center">Chat seleccionado: <span className="font-bold text-white">{selectedChat}</span></div>
                {messages.length === 0 && (
                  <div className="text-blue-300 text-center opacity-60 mt-6">No hay mensajes aún.</div>
                )}
                {messages.map((msg, idx) => {
                  const isMe = user && msg.user_id === user.id;
                  const sender = usersMap[msg.user_id] || {};
                  const avatar = sender.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.full_name || 'Usuario')}`;
                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-purple-400 mr-2" />
                      )}
                      <div className={`max-w-[80%] px-3 py-1.5 rounded-2xl shadow-md text-sm ${isMe ? 'bg-purple-700 text-white rounded-br-none' : 'bg-white/10 text-blue-100 rounded-bl-none'}`}>
                        <div className="text-xs font-semibold mb-0.5 flex items-center gap-2">
                          {!isMe && <span>{sender.full_name || 'Usuario'}</span>}
                          <span className="text-[10px] text-blue-300 ml-2">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="whitespace-pre-line break-words">{msg.content}</div>
                      </div>
                      {isMe && (
                        <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-purple-400 ml-2" />
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <span className="text-blue-200 text-base opacity-60">Selecciona una conversación para comenzar</span>
            )}
          </div>
        </div>
        {/* Campo de escritura y envío */}
        {selectedChat && (
          <form onSubmit={handleSend} className="w-full max-w-lg flex items-end gap-2 p-2 bg-gradient-to-t from-slate-900/80 via-purple-900/60 to-transparent">
            <textarea
              className="flex-1 bg-white/10 border border-white/20 rounded-lg p-2 text-blue-100 min-h-[32px] max-h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              placeholder="Escribe tu mensaje..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={500}
              disabled={sending}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-60 text-sm"
              disabled={sending}
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        )}
        {(error || success) && (
          <div className={`w-full max-w-lg text-center pb-2 ${error ? 'text-red-400' : 'text-green-400'}`}>{error || success}</div>
        )}
      </main>
    </div>
  );
};

export default MensajesPage; 