import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = "Type a skill and press Enter" }: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/20">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-brand-bg px-3 py-1 text-xs font-medium text-sky-500"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="inline-flex text-sky-400 hover:text-sky-600"
          >
            <X size={12} strokeWidth={2} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 border-none bg-transparent py-1 text-sm text-charcoal outline-none placeholder:text-gray-400"
      />
    </div>
  );
}
