"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Mic, SlidersHorizontal, TrendingUp, History, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchProducts } from "@/hooks/use-products";

interface SearchBarProps {
  open?: boolean;
  onClose?: () => void;
}

const trending = ["Fresh Tomatoes", "Organic Vegetables", "Frozen Fish", "Irish Potatoes", "Palm Oil"];

export function SearchBar({ open, onClose }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  const { data: suggestions, isLoading } = useSearchProducts(debouncedQuery, {
    enabled: debouncedQuery.trim().length >= 2,
  });

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const goToSearch = (value: string) => {
    if (!value.trim()) return;
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    setShowSuggestions(false);
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToSearch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    goToSearch(suggestion);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md animate-in fade-in-0">
      {/* Search form */}
      <div className="border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          <form onSubmit={handleSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search fresh produce, groceries..."
              className="h-12 rounded-2xl border-none bg-muted pl-10 pr-10 text-base"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Mic className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0">
            Cancel
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="mx-auto w-full max-w-3xl flex-1 overflow-auto px-4 py-4">
          {/* Trending */}
          {!query && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-semibold">Trending Searches</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSuggestionClick(item)}
                    className="rounded-full border bg-muted/50 px-4 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions list */}
          <div className="space-y-1">
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              {query ? "Suggestions" : "Popular Searches"}
            </h3>

            {query && debouncedQuery.trim().length >= 2 ? (
              isLoading ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>
              ) : suggestions && suggestions.length > 0 ? (
                suggestions.slice(0, 7).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.name)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div className="flex min-w-0 flex-1 items-center justify-between text-left">
                      <span className="truncate">{product.name}</span>
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                        {product.category?.name}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <button
                  onClick={() => goToSearch(debouncedQuery)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                >
                  <PackageSearch className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Search for "<strong>{debouncedQuery}</strong>"
                  </span>
                </button>
              )
            ) : (
              trending.slice(0, 5).map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(item)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                >
                  <History className="h-4 w-4 text-muted-foreground" />
                  <div className="text-left">
                    <span>{item}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
