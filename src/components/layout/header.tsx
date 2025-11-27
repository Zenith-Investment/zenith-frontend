"use client";

import { ReactNode, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NotificationCenter } from "@/components/notification-center";

interface HeaderProps {
  title: string;
  description?: ReactNode;
}

export function Header({ title, description }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter assets
      window.location.href = `/market?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className="flex h-16 items-center justify-between border-b bg-card px-6"
        role="banner"
      >
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSearchOpen(true)}
            aria-label="Abrir busca"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Buscar ativos..."
              className="w-64 pl-9"
              aria-label="Buscar ativos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Notifications */}
          <NotificationCenter />
        </div>
      </header>

      {/* Mobile Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-4 translate-y-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buscar ativos</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Ex: PETR4, VALE3..."
                className="pl-9"
                aria-label="Buscar ativos"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" disabled={!searchQuery.trim()}>
              Buscar
            </Button>
          </form>
          <div className="text-xs text-muted-foreground">
            Digite o ticker ou nome do ativo para buscar
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
