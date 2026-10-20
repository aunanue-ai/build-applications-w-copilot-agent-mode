import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot?: string; members: string[] };
const loadTeams = () => getJson<{ teams: Team[] }>('/api/teams').then(({ teams }) => teams);

export default function Teams() {
  return <CapabilityCard<Team>
    title="Teams"
    description="Manage teams and members."
    loadItems={loadTeams}
    emptyMessage="No teams yet."
    renderItems={(teams) => <ul className="list-group list-group-flush">
      {teams.map((team, index) => <li className="list-group-item" key={team._id ?? `${team.name}-${index}`}>
        <strong>{team.name}</strong>{team.mascot && <span> - {team.mascot}</span>}
        <div>{team.members.length} members</div>
      </li>)}
    </ul>}
  />;
}
