function Tableau({ colonnes, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden relative">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-full text-sm">
          <thead className="bg-slate-50/90 border-b-2 border-slate-200/70 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
            <tr>
              {colonnes.map((c, i) => (
                <th key={c} scope="col" className={`text-left align-middle px-6 py-4 whitespace-nowrap ${i === 0 ? 'pl-8' : ''}`}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Tableau