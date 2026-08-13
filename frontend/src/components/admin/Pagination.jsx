import { ChevronLeft, ChevronRight } from 'lucide-react'

function Pagination({ suivant, precedent, onSuivant, onPrecedent }) {
  if (!suivant && !precedent) return null
  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-4 sm:px-6 mt-6 rounded-2xl shadow-sm">
      <div className="flex flex-1 justify-between sm:hidden">
        <button onClick={onPrecedent} disabled={!precedent} className="relative inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors">
          Précédent
        </button>
        <button onClick={onSuivant} disabled={!suivant} className="relative ml-3 inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors">
          Suivant
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">
            Navigation des résultats
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Utilisez les flèches pour parcourir les pages</p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
            <button
              onClick={onPrecedent}
              disabled={!precedent}
              className="relative inline-flex items-center rounded-l-xl px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <span className="sr-only">Précédent</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={onSuivant}
              disabled={!suivant}
              className="relative inline-flex items-center rounded-r-xl px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:hover:bg-white transition-colors"
            >
              <span className="sr-only">Suivant</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Pagination