import { useMemo, useState } from "react";
import type { Activity, ActivityAction } from "../types/activity";
import { getActivities } from "../lib/storage";

// Normaliza para busca: minúsculas e sem acentos, para que "saida" encontre "Saída"
function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

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
    const q = norm(search.trim());
    return activities.filter((a) => {
      const matchesSearch =
        !q ||
        norm(a.target).includes(q) ||
        norm(a.user).includes(q) ||
        norm(a.entity).includes(q) ||
        (a.changes ?? []).some((c) => norm(c.label).includes(q));
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
