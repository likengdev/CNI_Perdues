import { motion } from 'framer-motion'
import BarreLaterale from '../admin/BarreLaterale'
import BarreSuperieure from '../admin/BarreSuperieure'

function MiseEnPageAdmin({ titre, children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-brand-500/30 selection:text-brand-900">
      <BarreLaterale />
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <BarreSuperieure titre={titre} />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-slate-50/50">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default MiseEnPageAdmin