"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

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
    if (!supabase) return; // Fermati qui se il client non è inizializzato
  
    const { data, error } = await supabase
      .from('schede_idea')
      .select('*')
      .order('id', { ascending: false });
  
    if (error) console.error('Errore:', error.message);
    else if (data) setSchede(data);
  }
  
  // Fai la stessa cosa all'inizio di handleSalva e handleElimina
  const handleSalva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return; 
    
    // Proviamo a inserire i dati
    const { data, error } = await supabase
      .from('schede_idea')
      .insert([{ 
        titolo: titolo, 
        master: master, 
        descrizione: descrizione, 
        manuale: manuale 
      }])
      .select();

    if (error) {
      // QUESTO CI DIRÀ IL VERO PROBLEMA
      console.error("ERRORE DETTAGLIATO:", error);
      alert(`Non riesco a salvare! Errore: ${error.message}`);
    } else {
      console.log("Salvataggio riuscito!", data);
      if (data) setSchede([data[0], ...schede]);
      setTitolo(''); setMaster(''); setDescrizione(''); setManuale('');
      setIsFormOpen(false);
    }
  };

  const handleElimina = async (id: number) => {
    const { error } = await supabase.from('schede_idea').delete().eq('id', id);
    if (!error) setSchede(schede.filter(s => s.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 relative">
      <aside className="w-64 bg-white border-r p-6">
        <h2 className="text-xl font-bold mb-4">Statistiche</h2>
        <div className="bg-blue-50 p-4 rounded-lg text-center font-bold text-blue-600">
          Idee: {schede.length}
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black">Le mie Schede</h1>
          <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold">
            + Nuova Idea
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {schede.map((scheda, index) => (
            /* La "key" deve essere sempre sull'elemento più esterno del ciclo */
            /* Usiamo l'ID se esiste, altrimenti l'indice come ruota di scorta */
            <div key={scheda.id || index} className="bg-white p-6 rounded-xl shadow-sm border relative">
              <button onClick={() => handleElimina(scheda.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">🗑️</button>
              <h3 className="text-2xl font-bold">{scheda.titolo}</h3>
              <p className="text-blue-600 text-sm mb-4">Master: {scheda.master}</p>
              <p className="text-gray-700">{scheda.descrizione}</p>
              <p className="mt-4 text-xs text-gray-400">Manuale: {scheda.manuale}</p>
            </div>
          ))}
        </div>
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Aggiungi Idea</h2>
            <form onSubmit={handleSalva} className="space-y-4">
              <input required placeholder="Titolo" value={titolo} onChange={e => setTitolo(e.target.value)} className="w-full p-2 border rounded" />
              <input required placeholder="Master" value={master} onChange={e => setMaster(e.target.value)} className="w-full p-2 border rounded" />
              <textarea required placeholder="Descrizione" value={descrizione} onChange={e => setDescrizione(e.target.value)} className="w-full p-2 border rounded" rows={3} />
              <input required placeholder="Manuale" value={manuale} onChange={e => setManuale(e.target.value)} className="w-full p-2 border rounded" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-2 bg-gray-100 rounded">Annulla</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}