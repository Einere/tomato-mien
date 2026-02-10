import { useAtom } from "jotai";
import { searchQueryAtom } from "@/store";
import { Icon } from "@/components/UI/Icon";

export function SearchBar() {
  const [query, setQuery] = useAtom(searchQueryAtom);

  return (
    <div className='relative mx-5 mb-4'>
      <Icon
        name='search'
        size='sm'
        className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
      />
      <input
        type='text'
        placeholder='Search rules...'
        aria-label='Search rules'
        value={query}
        onChange={e => setQuery(e.target.value)}
        className='w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-primary-500 focus-visible:ring-1 focus-visible:ring-primary-500 focus-visible:outline-none'
      />
    </div>
  );
}
