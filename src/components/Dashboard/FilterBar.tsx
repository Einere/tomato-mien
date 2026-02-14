import { useAtom, useAtomValue } from "jotai";
import {
  sortOrderAtom,
  activeRuleCountAtom,
  totalRuleCountAtom,
} from "@/store";
import type { SortOrder } from "@/store";
import { Select } from "@/components/UI/Select";

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "recent", label: "Recently created" },
];

export function FilterBar() {
  const [sortOrder, setSortOrder] = useAtom(sortOrderAtom);
  const activeCount = useAtomValue(activeRuleCountAtom);
  const totalCount = useAtomValue(totalRuleCountAtom);

  return (
    <div className="mx-5 mb-3 flex items-center justify-between">
      <span className="text-overline text-subtle-foreground">
        {activeCount} active / {totalCount} total
      </span>
      <Select
        value={sortOrder}
        onChange={v => setSortOrder(v as SortOrder)}
        options={sortOptions}
      />
    </div>
  );
}
