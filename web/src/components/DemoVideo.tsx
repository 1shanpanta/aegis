// SPDX-License-Identifier: Apache-2.0
import { motion } from "framer-motion";
import { Play, Clock } from "lucide-react";
import { Shader } from "./Shader";

const ease = [0.2, 0.7, 0.2, 1] as const;

type Props = {
  /**
   * Optional video URL. Accepts any YouTube share format (watch, youtu.be short,
   * embed, shorts) plus Loom / Vimeo embed URLs. YouTube URLs are auto-normalized
   * to the privacy-enhanced embed format with related-video chrome stripped.
   *
   * Unlisted YouTube videos work the same way — the iframe doesn't care, it just
   * needs the video ID. Anyone with the URL can play it.
   */
  embedUrl?: string;
  /** Optional MP4 source for a native <video> element. */
  videoSrc?: string;
  /** Poster shown before play. */
  poster?: string;
};

/**
 * Normalize any common YouTube share URL into the privacy-enhanced embed URL.
 * Handles:
 *   - https://www.youtube.com/watch?v=ID  (with or without other params)
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/shorts/ID
 *   - https://www.youtube.com/embed/ID    (already embed, just adds params)
 *   - https://www.youtube-nocookie.com/embed/ID (passes through)
 *
 * Returns the URL unchanged for Loom, Vimeo, and anything else.
 */
const normalizeVideoUrl = (raw: string | undefined): string | undefined => {
  if (!raw) return raw;
  let id: string | null = null;

  const watch = raw.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watch) id = watch[1];

  if (!id) {
    const short = raw.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
    if (short) id = short[1];
  }
  if (!id) {
    const shorts = raw.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
    if (shorts) id = shorts[1];
  }
  if (!id) {
    const embed = raw.match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{6,})/);
    if (embed) id = embed[1];
  }

  if (!id) return raw; // not YouTube, leave as-is for Loom/Vimeo/etc.

  // Privacy-enhanced host + clean chrome.
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    color: "white",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
};

export const DemoVideo = ({ embedUrl, videoSrc, poster }: Props) => {
  const resolvedEmbed = normalizeVideoUrl(embedUrl);
  return (
  <section className="relative w-full px-6 lg:px-10 py-32 lg:py-44">
    <div className="mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease }}
        className="flex items-end justify-between gap-8 mb-12 flex-wrap"
      >
        <div className="max-w-2xl">
          <div className="text-[11px] uppercase tracking-[0.22em] text-ink-500 mb-4">
            Watch the demo
          </div>
          <h2 className="text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.025em] text-ink-50">
            Two minutes.{" "}
            <span className="font-serif italic text-accent-300">Three views</span> of the same
            chain state.
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-ink-400 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>02:00</span>
          <span className="text-ink-700">·</span>
          <span className="uppercase tracking-[0.18em]">1440p</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.95, delay: 0.05, ease }}
        className="relative"
      >
        <div className="relative rounded-2xl overflow-hidden border border-ink-800/80 bg-ink-900">
          <div className="aspect-video w-full relative">
            {resolvedEmbed ? (
              <iframe
                src={resolvedEmbed}
                title="Aegis demo"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full"
              />
            ) : videoSrc ? (
              <video
                src={videoSrc}
                poster={poster}
                controls
                playsInline
                className="absolute inset-0 w-full h-full object-cover bg-ink-950"
              />
            ) : (
              <PlaceholderFrame />
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-[12px] text-ink-500">
          <span>
            Built solo for the{" "}
            <a
              href="https://midnight-hackathon-2026.devpost.com/"
              target="_blank"
              rel="noreferrer"
              className="text-ink-300 hover:text-ink-100 underline-offset-[3px] hover:underline"
            >
              Midnight Hackathon · May 2026
            </a>
            .
          </span>
          <span className="font-mono tabular-nums">aegis.demo.v1</span>
        </div>
      </motion.div>
    </div>
  </section>
  );
};

const PlaceholderFrame = () => (
  <div className="absolute inset-0 isolate">
    <div className="absolute inset-0 overflow-hidden">
      <Shader />
    </div>
    <div className="absolute inset-0 bg-gradient-to-b from-ink-950/30 via-ink-950/40 to-ink-950/70" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <button
          type="button"
          aria-label="Demo video coming soon"
          className="group inline-flex items-center justify-center w-20 h-20 rounded-full bg-ink-50/10 backdrop-blur-md border border-ink-50/20 hover:bg-ink-50/15 transition-all duration-300 mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        >
          <Play className="w-6 h-6 text-ink-50 ml-1 group-hover:scale-110 transition-transform" fill="currentColor" />
        </button>
        <p className="text-[14px] text-ink-200">
          Demo video lands here before submission.{" "}
          <span className="block mt-1 text-[12px] text-ink-400">
            Until then, scroll to play with the live simulator below.
          </span>
        </p>
      </div>
    </div>
  </div>
);
