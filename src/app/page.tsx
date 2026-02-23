"use client";

import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';

interface SchedaIdea {
  id: number;
  titolo: string;
  master: string;
  descrizione: string;
  manuale: string;
}

export default function Home() {
  const [schede, setSchede] = useState<SchedaIdea[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [titolo, setTitolo] = useState('');
  const [master, setMaster] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [manuale, setManuale] = useState('');

  useEffect(() => {
    fetchSchede();
  }, []);

  async function fetchSchede() {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data, error } = await supabase
      .from('schede_idea')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.error('Errore fetch:', error.message);
    else if (data) setSchede(data);
  }

  
    const handleSalva = async (e: React.FormEvent) => {
      e.preventDefault();
      // AGGIUNGI QUESTA RIGA:
      console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Trovato" : "NON TROVATO");
      
      const supabase = getSupabase();
      // ... resto del codice
    
    if (!supabase) {
      alert("Errore di configurazione: Controlla le chiavi su Vercel!");
      return;
    }

    const { data, error } = await supabase
      .from('schede_idea')
      .insert([{ titolo, master, descrizione, manuale }])
      .select();

    if (error) {
      alert(`Errore Tecnico: ${error.message} (Codice: ${error.code})`);
    } else if (data) {
      setSchede([data[0], ...schede]);
      setTitolo(''); setMaster(''); setDescrizione(''); setManuale('');
      setIsFormOpen(false);
    }
  };

  const handleElimina = async (id: number) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const conferma = confirm("Vuoi davvero eliminare questa idea?");
    if (!conferma) return;

    const { error } = await supabase
      .from('schede_idea')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Errore nell'eliminazione");
    } else {
      setSchede(schede.filter(s => s.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 relative">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Statistiche</h2>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
          <p className="text-sm text-gray-600 uppercase">Idee Totali</p>
          <p className="text-4xl font-black text-blue-600">{schede.length}</p>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Le mie Idee GDR</h1>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform active:scale-95"
          >
            + Nuova Scheda
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {schede.map((scheda) => (
            <div key={scheda.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative group">
              <button 
                onClick={() => handleElimina(scheda.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              >
                🗑️
              </button>
              <h3 className="text-2xl font-bold mb-1 pr-8">{scheda.titolo}</h3>
              <p className="text-sm text-blue-600 font-medium mb-3 italic">Master: {scheda.master}</p>
              <p className="text-gray-700 mb-6">{scheda.descrizione}</p>
              <div className="text-xs font-mono bg-gray-100 p-2 rounded border border-gray-200">
                📚 Manuale: {scheda.manuale}
              </div>
            </div>
          ))}
        </div>
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Crea una nuova idea</h2>
            <form onSubmit={handleSalva} className="space-y-4">
              <input required placeholder="Titolo" value={titolo} onChange={e => setTitolo(e.target.value)} className="w-full p-2 border rounded-md" />
              <input required placeholder="Master" value={master} onChange={e => setMaster(e.target.value)} className="w-full p-2 border rounded-md" />
              <textarea required placeholder="Descrizione" value={descrizione} onChange={e => setDescrizione(e.target.value)} className="w-full p-2 border rounded-md" rows={3} />
              <input required placeholder="Manuale" value={manuale} onChange={e => setManuale(e.target.value)} className="w-full p-2 border rounded-md" />
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-2 bg-gray-200 rounded-md font-bold">Annulla</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700">Salva Idea</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}