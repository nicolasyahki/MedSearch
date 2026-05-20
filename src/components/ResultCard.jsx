import Badge from './Badge'
import SyncButton from './SyncButton'

function ResultCard({ name, age, score, status, lastVisit }) {
  return (
    <div className="bg-bg-card border border-border rounded-card p-5 hover:border-border-strong transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-h3 text-text-primary mb-1">{name}</h3>
          <p className="text-sm text-text-secondary">Âge: {age} ans</p>
        </div>
        <SyncButton isOnline={true} />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <Badge score={score} />
        <span className="text-sm text-text-secondary">Statut: {status}</span>
      </div>
      <p className="text-xs text-text-muted">Dernière visite: {lastVisit}</p>
    </div>
  )
}

export default ResultCard
