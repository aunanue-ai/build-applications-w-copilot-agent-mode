import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };

export default function Workouts() {
  return <CapabilityCard<Workout>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    resourceKey="suggestions"
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
