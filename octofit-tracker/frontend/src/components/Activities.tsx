import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };
const loadActivities = () => getJson<{ activities: Activity[] }>('/api/activities').then(({ activities }) => activities);

export default function Activities() {
  return <CapabilityCard<Activity>
    title="Activities"
    description="Track student activity minutes and points."
    loadItems={loadActivities}
    emptyMessage="No activities yet."
    renderItems={(activities) => <ul className="list-group list-group-flush">
      {activities.map((activity, index) => <li className="list-group-item d-flex justify-content-between" key={activity._id ?? `${activity.type}-${index}`}>
        <span>{activity.type}</span><span>{activity.minutes} min - {activity.points} points</span>
      </li>)}
    </ul>}
  />;
}
