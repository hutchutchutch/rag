import { Dialog } from "@/components/ui/dialog";
import { cn } from "../../lib/utils";

export function SelectVectorStoreDialog({
  open,
  onClose,
  selected,
  setSelected,
  vectorStores
}: {
  open: boolean;
  onClose: () => void;
  selected: any;
  setSelected: (store: any) => void;
  vectorStores: any[];
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Select a Document">
      <div className="flex flex-col gap-2 p-4 w-[1200px] max-w-none">
        <div className="text-lg font-semibold mb-4">Select a Document</div>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid grid-cols-9 gap-2 px-2 py-2 border-b border-border text-xs font-semibold text-muted-foreground bg-background rounded-t-md">
              <div className="col-span-2">Name</div>
              <div>Chunks</div>
              <div>Tokens / Chunk (avg)</div>
              <div>Embedding model</div>
              <div>Vector dim.</div>
              <div>Index type</div>
              <div>Created</div>
              <div>Size (MB)</div>
            </div>
            {vectorStores.map((store) => (
              <button
                key={store.id}
                className={cn(
                  "grid grid-cols-9 gap-2 items-center w-full text-left px-2 py-3 border-b border-border transition-colors",
                  "cursor-pointer",
                  selected?.id === store.id ? "bg-accent/70" : "bg-background",
                  "hover:bg-accent/80 hover:ring-2 hover:ring-accent/40 focus:bg-accent/80"
                )}
                onClick={() => {
                  setSelected(store);
                  onClose();
                }}
              >
                <div className="col-span-2 font-medium text-foreground">{store.name}</div>
                <div>{store.chunks ?? "-"}</div>
                <div>{store.tokensPerChunk ?? "-"}</div>
                <div className="truncate max-w-[160px]">{store.embeddingModel ?? "-"}</div>
                <div>{store.vectorDim ?? "-"}</div>
                <div className="truncate max-w-[120px]">{store.indexType ?? "-"}</div>
                <div className="whitespace-nowrap">{store.created ?? "-"}</div>
                <div>{store.sizeMB ? `${store.sizeMB} MB` : "-"}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
} 