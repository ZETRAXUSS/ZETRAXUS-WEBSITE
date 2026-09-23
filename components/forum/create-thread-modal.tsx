"use client";

import { useEffect, useRef, useState } from "react";
import { createThread } from "@/lib/actions/forum";
import type { Database } from "@/types/database";

type ForumCategory = Database["public"]["Tables"]["forum_categories"]["Row"];

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ForumCategory[];
  onThreadCreated?: () => void;
}

export function CreateThreadModal({
  isOpen,
  onClose,
  categories,
  onThreadCreated,
}: CreateThreadModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title.trim() || !body.trim()) {
      setError("Title and body are required");
      setLoading(false);
      return;
    }

    if (!selectedCategory) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    const result = await createThread(selectedCategory, title, body);

    if (!result.success) {
      setError(result.error || "Failed to create thread");
      setLoading(false);
      return;
    }

    // Success
    setTitle("");
    setBody("");
    setSelectedCategory(categories[0]?.id || "");
    onThreadCreated?.();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-10">
        <div
          ref={modalRef}
          className="relative w-full max-w-[600px] rounded-[24px] border border-white/[0.12] bg-[#080808] shadow-[0_25px_100px_rgba(0,0,0,0.8)]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-white/60 transition-all hover:border-white/30 hover:bg-white/[0.1] hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Content */}
          <div className="p-8">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-white">
              Create Discussion
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Start a new thread in the community forum
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[2px] text-white/60 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-11 rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06]"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      className="bg-black text-white"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[2px] text-white/60 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your discussion about?"
                  maxLength={200}
                  className="w-full h-11 rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06]"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[2px] text-white/60 mb-2">
                  Description
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                  maxLength={2000}
                  rows={6}
                  className="w-full rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 focus:border-white/30 focus:bg-white/[0.06] resize-none"
                />
                <p className="mt-1 text-[9px] text-white/30">
                  {body.length}/2000 characters
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-[12px] text-red-400">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-lg border border-white/[0.12] bg-white/[0.03] text-[11px] font-semibold uppercase tracking-[2px] text-white/60 transition-all hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 rounded-lg border border-white/25 bg-white text-black text-[11px] font-semibold uppercase tracking-[2px] transition-all hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Thread"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
