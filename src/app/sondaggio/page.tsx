"use client";
import { useState, useEffect } from 'react';
import { getSupabase } from '../../../lib/supabase';

interface SchedaIdea {
  id: number;
  titolo: string;
  master: string;
  voti: number;
  in_sondaggio: boolean;
}

export default function SondaggioPage() {
  const [schede, setSchede] = useState<SchedaIdea[]>([]);

  useEffect(() => {
    fetchSondaggio();
  }, []);

  async function fetchSondaggio() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase
      .from('schede_idea')
      .select('*')
      .eq('in_sondaggio', true)
      .order('voti', { ascending: false });
    if (data) setSchede(data);
  }

  async function vota(id: number, votiAttuali: number) {
    const supabase = getSupabase();
    if (!supabase) return;
    
    const { error } = await supabase
      .from('schede_idea')
      .update({ voti: votiAttuali + 1 })
      .eq('id', id);

    if (!error) {
      setSchede(schede.map(s => s.id === id ? { ...s, voti: votiAttuali + 1 } : s));
    }
  }

  async function resetSondaggio() {
    if (!confirm("Sei sicuro di voler azzerare i voti e chiudere il sondaggio?")) return;
    const supabase = getSupabase();
    if (!supabase) return;

    // Azzeriamo i voti e togliamo lo stato "in_sondaggio" a tutte le righe
    const { error } = await supabase
      .from('schede_idea')
      .update({ voti: 0, in_sondaggio: false })
      .neq('id', 0); // Trucco per dire "aggiorna tutte le righe"

    if (!error) setSchede([]);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-yellow-400 uppercase tracking-tighter">Sondaggio Sessione Zero</h1>
          <button onClick={resetSondaggio} className="text-xs bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Resetta Tutto</button>
        </div>

        <div className="space-y-6">
          {schede.length > 0 ? (
            schede.map((scheda) => (
              <div key={scheda.id} className="bg-gray-800 border-2 border-gray-700 p-6 rounded-2xl flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{scheda.titolo}</h2>
                  <p className="text-gray-400 italic">Master: {scheda.master}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-black text-yellow-400">{scheda.voti}</p>
                    <p className="text-xs uppercase text-gray-500 tracking-widest">Voti</p>
                  </div>
                  <button 
                    onClick={() => vota(scheda.id, scheda.voti)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-xl transition-transform active:scale-90"
                  >
                    VOTA
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-20 border-2 border-dashed border-gray-700 rounded-2xl">
              Nessuna idea in ballottaggio. Aggiungine alcune dalla home!
            </p>
          )}
        </div>
        
        <button onClick={() => window.location.href = '/'} className="mt-12 text-gray-400 hover:text-white underline">
          ← Torna alla lista completa
        </button>
      </div>
    </div>
  );
}