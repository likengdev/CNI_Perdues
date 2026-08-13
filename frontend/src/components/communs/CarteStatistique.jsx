import { motion } from 'framer-motion'

function CarteStatistique({ libelle, valeur, couleur = '#0284c7', icon: Icon }) {
  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}
      className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col relative overflow-hidden transition-all duration-300 shadow-sm group"
    >
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-500 origin-top-right"
        style={{ backgroundColor: couleur }}
      />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <p className="text-sm font-medium text-slate-500">{libelle}</p>
        {Icon && (
          <div 
            className="p-2.5 rounded-xl transition-colors duration-300"
            style={{ backgroundColor: `${couleur}15`, color: couleur }}
          >
            <Icon size={20} strokeWidth={2.5} />
          </div>
        )}
      </div>
      <div className="mt-auto relative z-10">
        <p className="text-3xl font-bold tracking-tight text-slate-800">
          {valeur ?? '—'}
        </p>
      </div>
    </motion.div>
  )
}

export default CarteStatistique