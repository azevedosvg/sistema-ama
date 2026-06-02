import { useMemo, useState } from "react";
import type { Activity, ActivityAction } from "../types/activity";
import { getActivities } from "../lib/storage";

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>(() => getActivities());
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<"" | ActivityAction>("");
  const [userFilter, setUserFilter] = useState("");

  function refresh() {
    setActivities(getActivities());
  }

  const users = useMemo(
    () => Array.from(new Set(activities.map((a) => a.user))).sort(),
    [activities],
  );

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activities.filter((a) => {
      const matchesSearch =
        !q ||
        a.target.toLowerCase().includes(q) ||
        a.user.toLowerCase().includes(q) ||
        a.entity.toLowerCase().includes(q) ||
        (a.changes ?? []).some((c) => c.label.toLowerCase().includes(q));
      const matchesAction = !actionFilter || a.action === actionFilter;
      const matchesUser = !userFilter || a.user === userFilter;
      return matchesSearch && matchesAction && matchesUser;
    });
  }, [activities, search, actionFilter, userFilter]);

  return {
    activities: displayed,
    total: activities.length,
    users,
    search,
    actionFilter,
    userFilter,
    setSearch,
    setActionFilter,
    setUserFilter,
    refresh,
  };
}
