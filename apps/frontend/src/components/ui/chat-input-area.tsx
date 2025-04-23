"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "./textarea";
// import { cn } from "@/lib/utils";
// import the correct styles if there's an issue with absolute imports
import { cn } from "../../lib/utils";
import Marquee from "react-fast-marquee";
import { Dialog } from "@/components/ui/dialog";
import { SearchSettings, SearchSettingsValues } from "./search-settings";
import {
    ImageIcon,
    FileUp,
    BookOpen,
    SearchIcon,
    Database,
    ArrowUpIcon,
    PlusIcon,
    SlidersHorizontal,
} from "lucide-react";
import { useVectorStore } from "@/store/vectorStore";
import { vectorStores } from "@/mocks/vectorStores";
import { SelectVectorStoreDialog } from "@/components/chat/SelectVectorStoreDialog";


interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface ChatInputAreaProps {
    onSend?: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}

export function ChatInputArea({ 
    onSend, 
    isLoading = false, 
    placeholder = "Ask a question about your document..." 
}: ChatInputAreaProps) {
    const [value, setValue] = useState("");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [searchSettings, setSearchSettings] = useState<SearchSettingsValues>({
        efSearch: 128,
        distanceThreshold: 0.75,
        resultLimit: 5,
        useHybridSearch: false,
        hybridAlpha: 0.5,
        preprocessQuery: true
    });
    
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const { selected, setSelected } = useVectorStore();

    // Add state for dialog open/close
    const [isDocDialogOpen, setDocDialogOpen] = useState(false);

    // Force dark mode for this component
    useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => {
            // This is only relevant if you want to remove the class later
            // document.documentElement.classList.remove('dark');
        };
    }, []);

    const handleOpenSettings = () => {
        setIsSettingsOpen(true);
    };

    const handleCloseSettings = () => {
        setIsSettingsOpen(false);
    };

    const handleSaveSettings = (values: SearchSettingsValues) => {
        setSearchSettings(values);
        setIsSettingsOpen(false);
        // In a real app, you might want to save these settings to localStorage or a backend
        console.log("Search settings saved:", values);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading && onSend) {
                onSend(value);
                setValue("");
                adjustHeight(true);
            }
        }
    };
    
    const handleSendClick = () => {
        if (value.trim() && !isLoading && onSend) {
            onSend(value);
            setValue("");
            adjustHeight(true);
        }
    };

    return (
        <div className="flex flex-col w-full mx-auto p-4 space-y-4 bg-dark-800">
            <div className="w-full max-w-[800px] mx-auto">
            <div className="flex flex-row items-center gap-2 p-4 pb-0">
                <h2 className="text-lg font-semibold text-dark-50 leading-tight h-8 flex items-center">Chat with</h2>
                <button
                    type="button"
                    className="h-8 px-3 rounded-lg text-sm text-zinc-400 transition-colors border border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center gap-1"
                    onClick={() => setDocDialogOpen(true)}
                >
                    <PlusIcon className="w-4 h-4" />
                    {selected ? selected.name : "Select a Document"}
                </button>
            </div>
                <div className="relative bg-neutral-900 rounded-xl border border-neutral-800">
                    
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question about your document..."
                            className={cn(
                                "w-full px-4 py-3",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-white text-sm",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-neutral-500 placeholder:text-sm",
                                "min-h-[60px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleOpenSettings}
                                className="group p-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <SlidersHorizontal className="w-4 h-4 text-white" />
                                <span className="text-xs text-zinc-400 hidden group-hover:inline transition-opacity">
                                    Search Settings
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleSendClick}
                                disabled={!value.trim() || isLoading}
                                className={cn(
                                    "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1",
                                    value.trim() && !isLoading
                                        ? "bg-white text-black"
                                        : "text-zinc-400 opacity-50",
                                    isLoading && "cursor-not-allowed"
                                )}
                            >
                                <ArrowUpIcon
                                    className={cn(
                                        "w-4 h-4",
                                        value.trim() && !isLoading
                                            ? "text-black"
                                            : "text-zinc-400"
                                    )}
                                />
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                </div>

                <Dialog
                    open={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    title="Search Settings"
                >
                    <SearchSettings
                        initialValues={searchSettings}
                        onSave={handleSaveSettings}
                    />
                </Dialog>

                <div className="mt-4">
                    <Marquee
                        speed={30}
                        gradient={true}
                        gradientColor={"#1A1A1A"}
                        gradientWidth={50}
                        pauseOnHover={true}
                        className="py-2 h-14 overflow-hidden"
                    >
                        <div className="flex items-center gap-4 px-4 h-14">
                            <SuggestionButton
                                icon={<SearchIcon className="w-4 h-4" />}
                                label="Find main concepts"
                                onClick={() => {
                                    setValue("What are the main concepts in this document?");
                                    if (textareaRef.current) {
                                        textareaRef.current.focus();
                                        adjustHeight();
                                    }
                                }}
                            />
                            <SuggestionButton
                                icon={<BookOpen className="w-4 h-4" />}
                                label="Summarize document"
                                onClick={() => {
                                    setValue("Can you summarize this document for me?");
                                    if (textareaRef.current) {
                                        textareaRef.current.focus();
                                        adjustHeight();
                                    }
                                }}
                            />
                            <SuggestionButton
                                icon={<FileUp className="w-4 h-4" />}
                                label="What's the key takeaway?"
                                onClick={() => {
                                    setValue("What are the key takeaways from this document?");
                                    if (textareaRef.current) {
                                        textareaRef.current.focus();
                                        adjustHeight();
                                    }
                                }}
                            />
                            <SuggestionButton
                                icon={<Database className="w-4 h-4" />}
                                label="What is RAG?"
                                onClick={() => {
                                    setValue("What is RAG and how does it work?");
                                    if (textareaRef.current) {
                                        textareaRef.current.focus();
                                        adjustHeight();
                                    }
                                }}
                            />
                            <SuggestionButton
                                icon={<ImageIcon className="w-4 h-4" />}
                                label="Explain with examples"
                                onClick={() => {
                                    setValue("Can you explain this concept with examples?");
                                    if (textareaRef.current) {
                                        textareaRef.current.focus();
                                        adjustHeight();
                                    }
                                }}
                            />
                        </div>
                    </Marquee>
                </div>

                {/* Dialog for selecting vector store */}
                <SelectVectorStoreDialog
                    open={isDocDialogOpen}
                    onClose={() => setDocDialogOpen(false)}
                    selected={selected}
                    setSelected={setSelected}
                    vectorStores={vectorStores}
                />
            </div>
        </div>
    );
}

interface SuggestionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

function SuggestionButton({ icon, label, onClick }: SuggestionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
}
