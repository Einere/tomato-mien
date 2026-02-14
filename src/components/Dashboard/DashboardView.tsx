import { DashboardHeader } from "./DashboardHeader";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { RuleCardList } from "./RuleCardList";

export function DashboardView() {
  return (
    <div className="pb-4">
      <DashboardHeader />
      <SearchBar />
      <FilterBar />
      <RuleCardList />
    </div>
  );
}
