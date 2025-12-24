'use client';

import { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface SearchResult {
  type: string;
  id: string;
  title: string;
  href: string;
}

export function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Mock search results - in production, this would fetch from API
  const searchResults: SearchResult[] = [
    { type: 'Project', id: '1', title: 'Residential Building Project', href: '/projects/1' },
    { type: 'Customer', id: '2', title: 'John Doe', href: '/customers/2' },
    { type: 'Invoice', id: '3', title: 'INV-001', href: '/invoices/3' },
    { type: 'Quote', id: '4', title: 'QT-001', href: '/quotes/4' },
  ].filter(item => 
    query === '' || item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-sm text-gray-600 hover:text-gray-900 min-h-[44px]"
        aria-label="Search"
      >
        <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden lg:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-2xl">
          <Command className="rounded-lg border-0">
            <div className="flex items-center border-b px-3">
              <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search projects, customers, invoices..."
                value={query}
                onValueChange={setQuery}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0"
              />
              <button
                onClick={() => setOpen(false)}
                className="ml-2 p-1 rounded hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {searchResults.length > 0 && (
                <CommandGroup heading="Results">
                  {searchResults.map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      onSelect={() => handleSelect(result.href)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{result.title}</span>
                        <span className="text-xs text-muted-foreground">{result.type}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

