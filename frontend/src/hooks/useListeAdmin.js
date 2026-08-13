import { useCallback, useEffect, useState } from 'react'
import clientApi, { extraireMessageErreur } from '../api/client'
import { useAdmin } from '../contexte/ContexteAdmin'

export function useListeAdmin(urlInitiale) {
  const { token } = useAdmin()
  const [url, setUrl] = useState(urlInitiale)
  const [donnees, setDonnees] = useState([])
  const [suivant, setSuivant] = useState(null)
  const [precedent, setPrecedent] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  const charger = useCallback(async (cible) => {
    setChargement(true)
    setErreur('')
    try {
      const { data } = await clientApi.get(cible, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (Array.isArray(data)) {
        setDonnees(data)
        setSuivant(null)
        setPrecedent(null)
      } else {
        setDonnees(data.results || [])
        setSuivant(data.next || null)
        setPrecedent(data.previous || null)
      }
    } catch (err) {
      setErreur(extraireMessageErreur(err, 'Impossible de charger les données.'))
    } finally {
      setChargement(false)
    }
  }, [token])

  useEffect(() => { charger(url) }, [url, charger])

  return {
    donnees, chargement, erreur, suivant, precedent,
    allerSuivant: () => suivant && setUrl(suivant),
    allerPrecedent: () => precedent && setUrl(precedent),
    recharger: () => charger(url),
  }
}