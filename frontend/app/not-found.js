import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
      <h1 className="font-heading text-2xl font-semibold">Pagina nu a fost găsită</h1>
      <p className="text-muted-foreground text-sm">Verificați adresa URL.</p>
      <Link href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
        La rezumat
      </Link>
    </div>
  );
}
