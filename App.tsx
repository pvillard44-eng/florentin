
import React, { useState, useEffect, useMemo } from 'react';
import Calendar from './components/Calendar';
import DayModal from './components/DayModal';
import ShareModal from './components/ShareModal';
import Toast from './components/Toast';
import YearlySummary from './components/YearlySummary';
import { MonthData, DaySchedule } from './types';
import { MONTHS } from './constants';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  
  const [monthData, setMonthData] = useState<MonthData>(() => {
    const saved = localStorage.getItem('kidplan_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [hasUnsharedChanges, setHasUnsharedChanges] = useState(() => {
    return localStorage.getItem('kidplan_unshared') === 'true';
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error'; action?: () => void; actionLabel?: string } | null>(null);
  
  // Détection de partage par URL au chargement
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#data=')) {
      try {
        const base64 = hash.replace('#data=', '');
        const decodedData = JSON.parse(atob(base64));
        
        setToast({
          message: "Lien de partage détecté ! Voulez-vous importer ce planning ?",
          type: 'info',
          actionLabel: "Importer",
          action: () => {
            setMonthData(decodedData);
            setHasUnsharedChanges(false);
            window.location.hash = '';
            setToast({ message: "Planning mis à jour !", type: 'success' });
          }
        });
      } catch (e) {
        console.error("Erreur de décodage du lien", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kidplan_data', JSON.stringify(monthData));
  }, [monthData]);

  useEffect(() => {
    localStorage.setItem('kidplan_unshared', hasUnsharedChanges.toString());
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsharedChanges) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non partagées. Voulez-vous vraiment quitter ?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsharedChanges]);

  const handleDayClick = (date: Date) => {
    if (isRangeMode) {
      if (!selectedDate || (selectedDate && rangeEnd)) {
        setSelectedDate(date);
        setRangeEnd(null);
      } else {
        if (date < selectedDate) {
          setRangeEnd(selectedDate);
          setSelectedDate(date);
        } else {
          setRangeEnd(date);
        }
        setIsModalOpen(true);
      }
    } else {
      setSelectedDate(date);
      setRangeEnd(null);
      setIsModalOpen(true);
    }
  };

  const handleSaveDay = (schedule: DaySchedule) => {
    const startStr = schedule.date;
    const updates: MonthData = {};
    const startDate = new Date(startStr);
    const endDate = rangeEnd ? new Date(rangeEnd) : startDate;
    
    let current = new Date(startDate);
    while (current <= endDate) {
      const dStr = current.toISOString().split('T')[0];
      updates[dStr] = { date: dStr, parent: schedule.parent, notes: schedule.notes };
      current.setDate(current.getDate() + 1);
    }

    setMonthData(prev => ({ ...prev, ...updates }));
    setHasUnsharedChanges(true);
    setIsRangeMode(false);
    setRangeEnd(null);
    setIsModalOpen(false);
    setToast({ message: "Modifié (pensez à partager)", type: 'success' });
  };

  const handleImportData = (newData: MonthData) => {
    setMonthData(newData);
    setHasUnsharedChanges(false);
    setToast({ message: "Données importées avec succès", type: 'success' });
  };

  const handleSharedAction = () => {
    setHasUnsharedChanges(false);
  };

  const monthlyStats = useMemo(() => {
    const stats = { CARINE: 0, ROBERT: 0 };
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    Object.entries(monthData).forEach(([dateStr, schedule]) => {
      const s = schedule as DaySchedule;
      const date = new Date(dateStr);
      if (date.getFullYear() === year && date.getMonth() === month) {
        if (s.parent === 'CARINE') stats.CARINE++;
        if (s.parent === 'ROBERT') stats.ROBERT++;
      }
    });
    return stats;
  }, [monthData, currentDate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans selection:bg-indigo-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-3 backdrop-blur-md bg-white/80 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          
          <div className="flex items-center gap-3 shrink-0 mr-auto sm:mr-0">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="hidden xs:block">
              <h1 className="text-base font-black text-slate-800 tracking-tight leading-none">Planning Florentin</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Garde partagée</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:flex-1">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/50 shadow-inner">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - (viewMode === 'month' ? 1 : 12), 1))} 
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-500 hover:text-indigo-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="px-3 font-black text-slate-700 min-w-[120px] text-center text-[11px] uppercase tracking-wide">
                {viewMode === 'month' ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}` : currentDate.getFullYear()}
              </span>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (viewMode === 'month' ? 1 : 12), 1))} 
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-500 hover:text-indigo-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-2 group ${
                  hasUnsharedChanges 
                    ? 'bg-amber-500 text-white shadow-amber-200 animate-pulse hover:bg-amber-600' 
                    : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
                }`}
              >
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>{hasUnsharedChanges ? 'Partager les modifs' : 'Partager'}</span>
              </button>
              {hasUnsharedChanges && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
                </span>
              )}
            </div>
          </div>

          <div className="hidden lg:block w-[150px]"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100"><span className="text-xs font-bold text-rose-700">Carine: {monthlyStats.CARINE}j</span></div>
            <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100"><span className="text-xs font-bold text-blue-700">Robert: {monthlyStats.ROBERT}j</span></div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
             <div className="flex bg-slate-100 p-1 rounded-xl">
               <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Mois</button>
               <button onClick={() => setViewMode('year')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${viewMode === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Année</button>
             </div>
             <button onClick={() => { setIsRangeMode(!isRangeMode); setSelectedDate(null); setRangeEnd(null); }} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase border ${isRangeMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 hover:border-slate-300'}`}>Sélection Plage</button>
          </div>
        </div>

        {viewMode === 'month' ? (
          <Calendar currentMonth={currentDate} monthData={monthData} onDayClick={handleDayClick} selectionStart={selectedDate} selectionEnd={rangeEnd} />
        ) : (
          <YearlySummary year={currentDate.getFullYear()} monthData={monthData} />
        )}
      </main>

      {hasUnsharedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-lg animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-xs font-bold tracking-tight">Modifications non partagées</p>
            </div>
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shrink-0"
            >
              Partager maintenant
            </button>
          </div>
        </div>
      )}

      {selectedDate && isModalOpen && (
        <DayModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); if (!rangeEnd) setSelectedDate(null); }} onSave={handleSaveDay} date={selectedDate} endDate={rangeEnd || undefined} currentSchedule={monthData[selectedDate.toISOString().split('T')[0]]} />
      )}

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        monthData={monthData} 
        onImport={handleImportData}
        onShared={handleSharedAction}
      />
      {toast && <Toast message={toast.message} type={toast.type} action={toast.action} actionLabel={toast.actionLabel} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
