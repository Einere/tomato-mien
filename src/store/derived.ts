import { atom } from 'jotai';
import { rulesAtom, searchQueryAtom, sortOrderAtom } from './atoms';

export const activeRuleCountAtom = atom((get) => {
  return get(rulesAtom).filter((r) => r.enabled).length;
});

export const totalRuleCountAtom = atom((get) => {
  return get(rulesAtom).length;
});

export const filteredRulesAtom = atom((get) => {
  const rules = get(rulesAtom);
  const query = get(searchQueryAtom).toLowerCase().trim();
  const sortOrder = get(sortOrderAtom);

  const filtered = query
    ? rules.filter((r) => r.name.toLowerCase().includes(query))
    : [...rules];

  switch (sortOrder) {
    case 'recent':
      filtered.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'active':
      filtered.sort((a, b) => {
        if (a.enabled === b.enabled) {
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
        return a.enabled ? -1 : 1;
      });
      break;
  }

  return filtered;
});
