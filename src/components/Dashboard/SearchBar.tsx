import { useAtom } from "jotai";
import { searchQueryAtom } from "@/store";
import { Icon } from "@/components/UI/Icon";

export function SearchBar() {
  const [query, setQuery] = useAtom(searchQueryAtom);

  return (
    <div className="relative mx-5 mb-4">
      <Icon
        name="search"
        size="sm"
        className="text-subtle-foreground absolute top-1/2 left-3 -translate-y-1/2"
      />
      <input
        type="text"
        placeholder="Search rules..."
        aria-label="Search rules"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="focus-visible:border-primary-500 focus-visible:ring-ring border-border bg-surface text-body text-foreground placeholder:text-subtle-foreground w-full rounded-lg border py-2.5 pr-4 pl-10 focus-visible:ring-1 focus-visible:outline-none"
      />
    </div>
  );
}
