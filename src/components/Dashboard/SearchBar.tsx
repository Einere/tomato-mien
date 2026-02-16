import { useAtom } from "jotai";
import { searchQueryAtom } from "@/store";
import { SearchIcon, Input } from "@tomato-mien/ui";

export function SearchBar() {
  const [query, setQuery] = useAtom(searchQueryAtom);

  return (
    <div className="relative mx-5 mb-4">
      <SearchIcon className="text-subtle-foreground absolute top-1/2 left-3 -translate-y-1/2" />
      <Input
        type="search"
        placeholder="Search rules..."
        aria-label="Search rules"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full py-2.5 pr-4 pl-10"
      />
    </div>
  );
}
