import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };
const loadWorkoutSuggestions = () => getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`).then(({ suggestions }) => suggestions);

export default function Workouts() {
  return <CapabilityCard<Workout>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    loadItems={loadWorkoutSuggestions}
    emptyMessage="No workout suggestions yet."
    renderItems={(workouts) => <ul className="list-group list-group-flush">
      {workouts.map((workout, index) => <li className="list-group-item" key={`${workout.title}-${index}`}>
        <strong>{workout.title}</strong>{workout.focus && <span> - {workout.focus}</span>}
        {workout.minutes !== undefined && <div>{workout.minutes} min - {workout.difficulty}</div>}
        {workout.reason && <p className="mb-0">{workout.reason}</p>}
      </li>)}
    </ul>}
  />;
}
