import { useState, useEffect, useCallback } from "react";
import { fetchCaptcha } from "../api/captcha";
import { useI18n } from "../contexts/I18nContext";
import { RefreshCw } from "lucide-react";

interface PuzzleCaptchaProps {
  onSolved: (token: string, angle: number) => void;
}

export default function PuzzleCaptcha({ onSolved }: PuzzleCaptchaProps) {
  const { t } = useI18n();
  const [image, setImage] = useState("");
  const [token, setToken] = useState("");
  const [angle, setAngle] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCaptcha = useCallback(async () => {
    setLoading(true);
    setAngle(0);
    try {
      const response = await fetchCaptcha();
      setImage(response.data.image);
      setToken(response.data.token);
    } catch {
      setImage("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  useEffect(() => {
    if (token) {
      onSolved(token, angle);
    }
  }, [angle, token, onSolved]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="label">{t("auth.captchaRotate")}</span>
        <button
          type="button"
          onClick={loadCaptcha}
          className="p-1.5 rounded-md text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          title={t("auth.newCaptcha")}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0">
          {loading ? (
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          ) : image ? (
            <img
              src={image}
              alt="Captcha"
              className="w-20 h-20"
              style={{ transform: `rotate(${-angle}deg)`, transition: "transform 0.15s ease" }}
              draggable={false}
            />
          ) : (
            <span className="text-xs text-gray-400">Error</span>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-indigo-500"
            disabled={loading || !image}
          />
          <div className="text-xs text-gray-400 dark:text-zinc-500 text-center">{angle}°</div>
        </div>
      </div>
    </div>
  );
}
