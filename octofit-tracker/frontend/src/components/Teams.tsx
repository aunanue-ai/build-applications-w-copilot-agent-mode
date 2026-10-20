import { CapabilityCard } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot?: string; members: string[] };

export default function Teams() {
  return <CapabilityCard<Team>
    title="Teams"
    description="Manage teams and members."
    path="/api/teams"
    resourceKey="teams"
    emptyMessage="No teams yet."
    renderItems={(teams) => <ul className="list-group list-group-flush">
      {teams.map((team, index) => <li className="list-group-item" key={team._id ?? `${team.name}-${index}`}>
        <strong>{team.name}</strong>{team.mascot && <span> - {team.mascot}</span>}
        <div>{team.members.length} members</div>
      </li>)}
    </ul>}
  />;
}
