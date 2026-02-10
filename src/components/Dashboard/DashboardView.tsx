import { DashboardHeader } from "./DashboardHeader";
import { SearchBar } from "./SearchBar";
import { StatsBar } from "./StatsBar";
import { FilterBar } from "./FilterBar";
import { RuleCardList } from "./RuleCardList";
import { SmartSuggestions } from "./SmartSuggestions";

export function DashboardView() {
  return (
    <div className='pb-4'>
      <DashboardHeader />
      <SearchBar />
      <StatsBar />
      <FilterBar />
      <RuleCardList />
      <SmartSuggestions />
    </div>
  );
}
