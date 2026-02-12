import { atom } from "jotai";
import { rulesAtom, searchQueryAtom, sortOrderAtom } from "./atoms";

export const activeRuleCountAtom = atom(get => {
  return get(rulesAtom).filter(r => r.enabled).length;
});

export const totalRuleCountAtom = atom(get => {
  return get(rulesAtom).length;
});

export const filteredRulesAtom = atom(get => {
  const rules = get(rulesAtom);
  const query = get(searchQueryAtom).toLowerCase().trim();
  const sortOrder = get(sortOrderAtom);

  const filtered = query
    ? rules.filter(r => r.name.toLowerCase().includes(query))
    : [...rules];

  switch (sortOrder) {
    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "recent":
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
  }

  return filtered;
});
