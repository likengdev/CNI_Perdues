import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const NOMS_MOIS = [
  'Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc',
]

function formaterMois(cleAnneeMois) {
  const [annee, mois] = cleAnneeMois.split('-')
  return `${NOMS_MOIS[parseInt(mois, 10) - 1]} ${annee}`
}

function GraphiqueRestitutions({ donnees }) {
  const donneesFormatees = donnees.map((d) => ({
    mois: formaterMois(d.mois),
    'CNI restituées': d.nombre,
  }))

  if (donneesFormatees.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">CNI restituées par mois</h2>
        <p className="text-sm text-slate-400 py-10 text-center">
          Aucune restitution clôturée pour le moment.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-800 mb-4">CNI restituées par mois</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={donneesFormatees}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Bar dataKey="CNI restituées" fill="#0284c7" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GraphiqueRestitutions