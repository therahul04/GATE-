'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useProgress } from '@/context/ProgressContext';
import { Save, Edit3, Eye } from 'lucide-react';

interface NoteEditorProps {
    resourceId: string;
}

export function MarkdownNoteEditor({ resourceId }: NoteEditorProps) {
    const { progress, saveNote } = useProgress();
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (progress.notes && progress.notes[resourceId]) {
            setContent(progress.notes[resourceId]);
        } else {
            setContent('');
        }
    }, [resourceId, progress.notes]);

    const handleSave = async () => {
        setIsSaving(true);
        await saveNote(resourceId, content);
        setIsSaving(false);
        setIsEditing(false);
    };

    return (
        <div className="rounded-lg overflow-hidden mt-6" style={{ border: '1px solid var(--notion-border)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[var(--notion-bg-secondary)]" style={{ borderBottom: '1px solid var(--notion-border)' }}>
                <div className="flex gap-1">
                    <button onClick={() => setIsEditing(true)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${isEditing ? 'bg-[var(--notion-bg-active)] text-[var(--notion-text)]' : 'text-[var(--notion-text-secondary)] hover:bg-[var(--notion-bg-hover)]'}`}
                    >
                        <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => setIsEditing(false)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${!isEditing ? 'bg-[var(--notion-bg-active)] text-[var(--notion-text)]' : 'text-[var(--notion-text-secondary)] hover:bg-[var(--notion-bg-hover)]'}`}
                    >
                        <Eye className="w-3 h-3" /> Preview
                    </button>
                </div>
                {isEditing && (
                    <button onClick={handleSave} disabled={isSaving}
                        className="px-3 py-1.5 bg-[var(--notion-accent)] text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50 hover:brightness-[1.1]"
                    >
                        <Save className="w-3 h-3" /> {isSaving ? 'Saving...' : 'Save'}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="min-h-[250px] max-h-[500px] overflow-y-auto">
                {isEditing ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your study notes here... Supports Markdown and LaTeX ($E=mc^2$)"
                        className="w-full h-full min-h-[250px] bg-[var(--notion-bg)] text-[var(--notion-text)] p-5 focus:outline-none resize-none font-mono text-sm leading-relaxed placeholder:text-[var(--notion-text-tertiary)]"
                    />
                ) : (
                    <div className="p-5 prose prose-invert max-w-none text-sm
                        prose-headings:text-[var(--notion-text)] prose-headings:font-semibold
                        prose-a:text-[var(--notion-accent)] prose-p:text-[var(--notion-text-secondary)]
                        prose-li:text-[var(--notion-text-secondary)]
                        prose-code:text-[var(--notion-orange)] prose-code:bg-[var(--notion-orange-bg)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                        prose-pre:bg-[var(--notion-bg-secondary)] prose-pre:border prose-pre:border-[var(--notion-border)]"
                    >
                        {content.trim() === '' ? (
                            <div className="text-[var(--notion-text-tertiary)] italic flex items-center justify-center h-[150px]">
                                No notes yet. Switch to Edit mode to start typing.
                            </div>
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {content}
                            </ReactMarkdown>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
