import { CapabilityCard } from './CapabilityCard.js';

type Entry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return <CapabilityCard<Entry>
    title="Leaderboard"
    description="Compare team point totals."
    path="/api/leaderboard"
    resourceKey="leaderboard"
    emptyMessage="No leaderboard rankings yet."
    renderItems={(entries) => <ol className="list-group list-group-numbered">
      {entries.map((entry) => <li className="list-group-item d-flex justify-content-between" key={entry.rank}>
        <span>{entry.teamName}</span><strong>{entry.totalPoints} points</strong>
      </li>)}
    </ol>}
  />;
}
