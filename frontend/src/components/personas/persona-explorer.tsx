"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";

import { FeaturedPersonaCard } from "@/components/personas/featured-persona-card";
import { PersonaCard } from "@/components/personas/persona-card";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import type { Persona, PersonaCategoryFilter } from "@/types/persona";

/**
 * Persona discovery.
 *
 * Personas are fetched on the server (see the page component) and passed in;
 * search and category filtering run locally for instant feedback.
 */
export function PersonaExplorer({
  personas,
}: {
  personas: Persona[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PersonaCategoryFilter>("All");

  const all = useMemo(() => personas, [personas]);

  const featured = useMemo(
    () => all.find((persona) => persona.featured),
    [all],
  );

  const recent = useMemo(
    () =>
      [...all]
        .filter((persona) => persona.lastConversationAt)
        .sort(
          (a, b) =>
            new Date(b.lastConversationAt!).getTime() -
            new Date(a.lastConversationAt!).getTime(),
        )
        .slice(0, 3),
    [all],
  );

  const availableCategories = useMemo(
    () => ["All", ...new Set(all.map((persona) => persona.category))],
    [all],
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return all.filter((persona) => {
      if (category !== "All" && persona.category !== category) return false;
      if (!term) return true;
      return [persona.name, persona.tagline, persona.category, ...persona.personality]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [all, category, query]);

  const isFiltering = query.trim().length > 0 || category !== "All";

  return (
    <div className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Persona library"
          title="Who do you want to talk to?"
          description="Every persona is a different voice, a different mind and a different way of listening."
        />
        <CategoryFilters
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          categories={availableCategories}
        />
        {featured && !isFiltering ? (
          <section className="mt-14">
            <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.16em] text-mist-500">
              Featured
            </h2>
            <FeaturedPersonaCard persona={featured} />
          </section>
        ) : null}
        {!isFiltering && recent.length > 0 ? (
          <section className="mt-14">
            <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.16em] text-mist-500">
              Recently used
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((persona) => (
                <PersonaCard key={persona.id} persona={persona} />
              ))}
            </div>
          </section>
        ) : null}
        <ResultsGrid
          personas={results}
          isFiltering={isFiltering}
          onClear={() => {
            setQuery("");
            setCategory("All");
          }}
        />
      </div>
    </div>
  );
}

function CategoryFilters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  category: PersonaCategoryFilter;
  onCategoryChange: (value: PersonaCategoryFilter) => void;
  categories: string[];
}) {
  return (
    <div className="mt-12 space-y-5">
      <div className="relative max-w-xl">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search personas, traits or categories"
          aria-label="Search personas"
          className="h-12 pl-11 pr-11"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-mist-400 transition-colors hover:bg-white/8 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => {
          const isActive = category === item;
          return (
            <button

              key={item}
              type="button"
              aria-pressed={isActive}
              onClick={() => onCategoryChange(item as PersonaCategoryFilter)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] transition-all duration-300",
                isActive
                  ? "border-brand-500/40 bg-brand-500/12 text-brand-400"
                  : "border-white/10 text-mist-400 hover:border-white/20 hover:text-white",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultsGrid({
  personas: results,
  isFiltering,
  onClear,
}: {
  personas: Persona[];
  isFiltering: boolean;
  onClear: () => void;
}) {
  return (
    <section className="mt-14">
      <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.16em] text-mist-500">
        {isFiltering
          ? `${results.length} result${results.length === 1 ? "" : "s"}`
          : "All personas"}
      </h2>

      {results.length === 0 ? (
        <div className="glass rounded-3xl px-6 py-16 text-center">
          <Search className="mx-auto h-6 w-6 text-mist-500" />
          <p className="mt-4 text-[15px] text-white">No personas found</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-mist-500">
            Try a different search term, or build the persona you were looking
            for.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={onClear}>
              Clear filters
            </Button>
            <Button asChild>
              <Link href="/personas/create">Create a persona</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} showKnowledge />
          ))}
        </div>
      )}
    </section>
  );
}
