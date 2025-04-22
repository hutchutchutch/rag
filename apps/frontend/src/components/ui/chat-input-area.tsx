"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "./textarea";
// import { cn } from "@/lib/utils";
// import the correct styles if there's an issue with absolute imports
import { cn } from "../../lib/utils";
import {
    ImageIcon,
    FileUp,
    BookOpen,
    SearchIcon,
    Database,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
} from "lucide-react";

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
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    // Force dark mode for this component
    useEffect(() => {
        document.documentElement.classList.add('dark');
        return () => {
            // This is only relevant if you want to remove the class later
            // document.documentElement.classList.remove('dark');
        };
    }, []);

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
        <div className="flex flex-col w-full mx-auto p-4 space-y-4">
            <div className="w-full max-w-[800px] mx-auto">
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
                                className="px-2 py-1 rounded-lg text-sm text-zinc-400 transition-colors border border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Select a Document
                            </button>
                            
                            <button
                                type="button"
                                className="group p-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Paperclip className="w-4 h-4 text-white" />
                                <span className="text-xs text-zinc-400 hidden group-hover:inline transition-opacity">
                                    Attach
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

                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                    <SuggestionButton
                        icon={<SearchIcon className="w-4 h-4" />}
                        label="Find main concepts"
                        onClick={() => {
                            if (onSend) {
                                onSend("What are the main concepts in this document?");
                            }
                        }}
                    />
                    <SuggestionButton
                        icon={<BookOpen className="w-4 h-4" />}
                        label="Summarize document"
                        onClick={() => {
                            if (onSend) {
                                onSend("Can you summarize this document for me?");
                            }
                        }}
                    />
                    <SuggestionButton
                        icon={<FileUp className="w-4 h-4" />}
                        label="What's the key takeaway?"
                        onClick={() => {
                            if (onSend) {
                                onSend("What are the key takeaways from this document?");
                            }
                        }}
                    />
                    <SuggestionButton
                        icon={<Database className="w-4 h-4" />}
                        label="What is RAG?"
                        onClick={() => {
                            if (onSend) {
                                onSend("What is RAG and how does it work?");
                            }
                        }}
                    />
                    <SuggestionButton
                        icon={<ImageIcon className="w-4 h-4" />}
                        label="Explain with examples"
                        onClick={() => {
                            if (onSend) {
                                onSend("Can you explain this concept with examples?");
                            }
                        }}
                    />
                </div>
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
