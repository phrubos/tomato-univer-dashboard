/** A *-gal jelölt fajták magyarázata – csak akkor jelenik meg, ha van ilyen fajta. */
export default function EarlyVarietyNote({ varietyNames }: { varietyNames: string[] }) {
  if (!varietyNames.some(name => name.includes('*'))) return null;

  return (
    <p className="mt-3 text-center text-xs text-gray-600 dark:text-muted-foreground">
      *=korai, középkorai fajták
    </p>
  );
}
