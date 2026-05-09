"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSearch = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = q.trim();
      if (!trimmed) return;
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [q, router],
  );

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
          <Link href="/" className="font-heading text-base font-semibold tracking-tight">
            Detector manipulare
          </Link>
          <NavigationMenu>
            <NavigationMenuList className="flex flex-wrap gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className={cn(
                      "inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                Rezumat
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/sessions"
                    className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                Ședințe
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/analyze"
                    className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                Încarcă PDF
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <form
          onSubmit={onSearch}
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center md:max-w-md"
        >
          <Input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Căutare în fragmente…"
            className="flex-1"
            aria-label="Căutare"
          />
          <Button type="submit" variant="secondary">
            Caută
          </Button>
        </form>
      </div>
      <Separator />
    </header>
  );
}
