import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(_input: unknown) {
  if (typeof _input !== 'object' || _input === null || Array.isArray(_input)) {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = _input as Record<string, unknown>;
  const objectIdPattern = /^[0-9a-f]{24}$/i;
  if (typeof userId !== 'string' || !objectIdPattern.test(userId)
    || typeof teamId !== 'string' || !objectIdPattern.test(teamId)
    || typeof type !== 'string' || !type.trim()
    || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('Valid userId, teamId, type, and positive minutes are required'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id').lean(),
    Team.findById(teamId).select('_id').lean(),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user and team must exist'), { status: 400 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  if (typeof _input !== 'object' || _input === null || Array.isArray(_input)) {
    throw Object.assign(new Error('Team input must be an object'), { status: 400 });
  }

  const { name, mascot, members = [] } = _input as Record<string, unknown>;
  const objectIdPattern = /^[0-9a-f]{24}$/i;
  if (typeof name !== 'string' || !name.trim()
    || typeof mascot !== 'string' || !mascot.trim()
    || !Array.isArray(members)
    || members.some((member) => typeof member !== 'string' || !objectIdPattern.test(member))) {
    throw Object.assign(new Error('A team name, mascot, and valid member IDs are required'), { status: 400 });
  }

  const existingMembers = await User.find({ _id: { $in: members } }).select('_id').lean();
  if (existingMembers.length !== new Set(members).size) {
    throw Object.assign(new Error('All team members must exist'), { status: 400 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members });
}

export async function getLeaderboard() {
  const [teams, activityTotals] = await Promise.all([
    Team.find().select('_id name').lean(),
    Activity.aggregate([{ $group: { _id: '$team', totalPoints: { $sum: '$points' } } }]),
  ]);
  const pointsByTeam = new Map(activityTotals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));

  return teams
    .map(({ _id, name }) => ({ teamName: name, totalPoints: pointsByTeam.get(_id.toString()) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).select('type').lean(),
    Workout.find().lean(),
  ]);
  const goalFocus = user.fitnessGoal.toLowerCase();
  const focusForActivity = (type: string) => ['run', 'running', 'cycle', 'cycling', 'walk', 'walking', 'swim', 'swimming'].includes(type.toLowerCase())
    ? 'endurance'
    : type.toLowerCase();
  const recentFocuses = activities.map(({ type }) => focusForActivity(type));

  return workouts
    .filter((workout) => workout.focus.toLowerCase() === goalFocus || recentFocuses.includes(workout.focus.toLowerCase()))
    .sort((left, right) => {
      const leftMatchesGoal = left.focus.toLowerCase() === goalFocus ? 1 : 0;
      const rightMatchesGoal = right.focus.toLowerCase() === goalFocus ? 1 : 0;
      return rightMatchesGoal - leftMatchesGoal || (left.title ?? '').localeCompare(right.title ?? '');
    })
    .map((workout) => {
      const reasons = [];
      if (workout.focus.toLowerCase() === goalFocus) reasons.push(`matches your ${user.fitnessGoal} goal`);
      const recentActivity = activities.find(({ type }) => focusForActivity(type) === workout.focus.toLowerCase());
      if (recentActivity) reasons.push(`fits your recent ${recentActivity.type} activity`);
      return { ...workout, reason: `Recommended because it ${reasons.join(' and ')}.` };
    });
}

export { User };
