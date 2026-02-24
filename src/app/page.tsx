"use client";

import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../lib/supabase';

if (typeof window !== "undefined") {
  console.log("DEBUG CHIAVI:");
  console.log("URL presente?", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("KEY presente?", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

interface SchedaIdea {
  id: number;
  titolo: string;
  master: string;
  descrizione: string;
  manuale: string;
  voti: number;
  in_sondaggio: boolean;
  immagine?: string;
}

export default function Home() {
  const [schede, setSchede] = useState<SchedaIdea[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [titolo, setTitolo] = useState('');
  const [master, setMaster] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [manuale, setManuale] = useState('');
  const [immagine, setImmagine] = useState('');
  const [filtroMaster, setFiltroMaster] = useState('');
  const [filtroTitolo, setFiltroTitolo] = useState('');
  const [filtroManuale, setFiltroManuale] = useState('');
  
  const [schedaEspansa, setSchedaEspansa] = useState<SchedaIdea | null>(null);
  const LIMITE_CARATTERI = 700;

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
      .insert([{ titolo, master, descrizione, manuale, immagine }])
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

  async function toggleSondaggio(id: number, statoAttuale: boolean) {
    const supabase = getSupabase();
    if (!supabase) return;

    // Invertiamo lo stato: se era false diventa true, e viceversa
    const nuovoStato = !statoAttuale;

    const { error } = await supabase
      .from('schede_idea')
      .update({ in_sondaggio: nuovoStato })
      .eq('id', id);

    if (error) {
      console.error("Errore aggiornamento:", error);
      alert("Errore nell'aggiornamento del sondaggio.");
    } else {
      // Aggiorniamo la lista visibile senza ricaricare la pagina
      setSchede(schede.map(scheda => 
        scheda.id === id ? { ...scheda, in_sondaggio: nuovoStato } : scheda
      ));
    }
  }

  const schedeFiltrate = schede.filter(scheda => {
    const matchMaster = (scheda.master || "").toLowerCase().includes(filtroMaster.toLowerCase());
    const matchTitolo = (scheda.titolo || "").toLowerCase().includes(filtroTitolo.toLowerCase());
    const matchManuale = (scheda.manuale || "").toLowerCase().includes(filtroManuale.toLowerCase()); // Nuovo controllo
    
    return matchMaster && matchTitolo && matchManuale; // Devono essere tutti veri
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 relative">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col">
  <h2 className="text-xl font-bold mb-4 text-blue-800">Statistiche</h2>
  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center mb-6">
    <p className="text-sm text-gray-600 uppercase">Idee Totali</p>
    <p className="text-4xl font-black text-blue-600">{schedeFiltrate.length}</p>
  </div>
  
  {/* AGGIUNGI QUESTO LINK */}
  <a 
    href="/sondaggio" 
    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-4 rounded-xl text-center shadow-sm transition-all"
  >
    Vai al Sondaggio 🗳️
  </a>
</aside>

<main className="flex-1 p-8 overflow-y-auto">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
    <div>
      <h1 className="text-3xl font-extrabold text-gray-800">Le mie Idee GDR</h1>
      {/* Opzionale: un piccolo contatore visibile anche da mobile */}
      <p className="text-sm text-gray-500 md:hidden">Idee totali: {schedeFiltrate.length}</p>
    </div>

    <div className="flex gap-2 w-full sm:w-auto">
      {/* TASTO SONDAGGIO - Giallo e visibile ovunque */}
      <a 
        href="/sondaggio" 
        className="flex-1 sm:flex-none bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-6 rounded-full shadow-lg text-center transition-transform active:scale-95"
      >
        Vota 🗳️
      </a>

      {/* TASTO NUOVA SCHEDA */}
      <button 
        onClick={() => setIsFormOpen(true)}
        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform active:scale-95"
      >
        + Nuova
      </button>
    </div>
  </div>
{/* SEZIONE FILTRI */}
{/* SEZIONE FILTRI AGGIORNATA */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-blue-600 uppercase mb-1 ml-1">Cerca Campagna</label>
            <input 
              type="text"
              placeholder="Titolo..."
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={filtroTitolo}
              onChange={(e) => setFiltroTitolo(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-blue-600 uppercase mb-1 ml-1">Filtra Master</label>
            <input 
              type="text"
              placeholder="Nome master..."
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={filtroMaster}
              onChange={(e) => setFiltroMaster(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-blue-600 uppercase mb-1 ml-1">Filtra Manuale</label>
            <input 
              type="text"
              placeholder="Es: D&D 5e, PF2..."
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={filtroManuale}
              onChange={(e) => setFiltroManuale(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {schedeFiltrate.map((scheda) => (
            
            
              
              <div key={scheda.id} 
              onClick={() => setSchedaEspansa(scheda)} // <--- Apre il dettaglio al click
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative group hover:border-blue-300 transition-all cursor-pointer hover:shadow-md">
              <button 
                onClick={() => handleElimina(scheda.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              >
                🗑️
              </button>
              <h3 className="text-2xl font-bold mb-1 pr-8">{scheda.titolo}</h3>
              <p className="text-sm text-blue-600 font-medium mb-3 italic">Master: {scheda.master}</p>
              <p className="text-gray-700 mb-6">
    {scheda.descrizione.length > LIMITE_CARATTERI 
      ? scheda.descrizione.substring(0, LIMITE_CARATTERI) + "..." 
      : scheda.descrizione}
    {scheda.descrizione.length > LIMITE_CARATTERI && (
      <span className="text-blue-500 font-bold ml-2">Leggi tutto →</span>
    )}
  </p>
              <div className="text-xs font-mono bg-gray-100 p-2 rounded border border-gray-200 mb-4">
                📚 Manuale: {scheda.manuale}
              </div>
              {scheda.immagine && (
  <div className="w-full h-40 mb-4 overflow-hidden rounded-lg">
    <img 
      src={scheda.immagine} 
      alt={scheda.titolo} 
      className="w-full h-full object-cover transition-transform group-hover:scale-105"
    />
  </div>
)}
              {/* NUOVO TASTO SONDAGGIO */}
              <button
                onClick={() => toggleSondaggio(scheda.id, scheda.in_sondaggio)}
                className={`w-full py-2 rounded-lg font-bold transition-all ${
                  scheda.in_sondaggio 
                    ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border border-yellow-500 shadow-inner" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200"
                }`}
              >
                {scheda.in_sondaggio ? "⭐ Nel Sondaggio" : "➕ Aggiungi al Sondaggio"}
              </button>
            </div>
          
          ))}
        </div>
      </main>

{/* MODAL DETTAGLIO COMPLETO */}
{schedaEspansa && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
      <button 
        onClick={() => setSchedaEspansa(null)}
        className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
      >
        ✕
      </button>
      
      <h2 className="text-3xl font-black mb-2 text-gray-900">{schedaEspansa.titolo}</h2>
      <p className="text-blue-600 font-bold italic mb-6">Master: {schedaEspansa.master} | Manuale: {schedaEspansa.manuale}</p>
      
      <div className="prose prose-blue max-w-none">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
          {schedaEspansa.descrizione}
        </p>
        {/* Nel modal della scheda espansa */}
{schedaEspansa.immagine && (
  <img 
    src={schedaEspansa.immagine} 
    alt={schedaEspansa.titolo} 
    className="w-full h-64 object-cover rounded-xl mb-6 shadow-md"
  />
)}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <button 
          onClick={() => setSchedaEspansa(null)}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
        >
          Chiudi Dettaglio
        </button>
      </div>
    </div>
  </div>
)}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Crea una nuova idea</h2>
            <form onSubmit={handleSalva} className="space-y-4">
              <input required placeholder="Titolo" value={titolo} onChange={e => setTitolo(e.target.value)} className="w-full p-2 border rounded-md" />
              <input required placeholder="Master" value={master} onChange={e => setMaster(e.target.value)} className="w-full p-2 border rounded-md" />
              <textarea required placeholder="Descrizione" value={descrizione} onChange={e => setDescrizione(e.target.value)} className="w-full p-2 border rounded-md" rows={3} />
              <input required placeholder="Manuale" value={manuale} onChange={e => setManuale(e.target.value)} className="w-full p-2 border rounded-md" />
              <input 
                placeholder="URL Immagine (opzionale)" 
                value={immagine} 
                onChange={e => setImmagine(e.target.value)} 
                className="w-full p-2 border rounded-md" />

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