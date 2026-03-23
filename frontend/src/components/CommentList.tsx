import type { CommentResponse } from "../api/tickets";
import { getInitials } from "../utils";
import { Lock } from "lucide-react";
import { useI18n } from "../contexts/I18nContext";

export default function CommentList({ comments }: { comments: CommentResponse[] }) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={`p-4 rounded-lg border ${
            comment.internal
              ? "bg-amber-50/50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20"
              : "bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-semibold text-gray-600 dark:text-zinc-300">
              {getInitials(comment.authorName)}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">{comment.authorName}</span>
            <span className="text-[11px] text-gray-400 dark:text-zinc-500 tabular-nums">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            {comment.internal && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
                <Lock size={10} /> {t("detail.internal")}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed pl-8">{comment.content}</p>
        </div>
      ))}
      {comments.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-8">{t("detail.noComments")}</p>
      )}
    </div>
  );
}
