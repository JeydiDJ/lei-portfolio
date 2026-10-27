import { useCallback, useEffect, useRef, useState } from "react";
import { LinearFilter, SRGBColorSpace, VideoTexture } from "three";

/** One media element per selected film; release decoding and audio when leaving the TV. */
export default function useTelevisionVideo(
  src: string | null,
  active: boolean,
) {
  const video = useRef<HTMLVideoElement | null>(null);
  const channel = useRef<BroadcastChannel | null>(null);
  const [texture, setTexture] = useState<VideoTexture | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [aspect, setAspect] = useState(16 / 9);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const playback = new BroadcastChannel("leila-portfolio-speaker");
    channel.current = playback;
    playback.onmessage = (e) => {
      if (e.data === "claim-playback") video.current?.pause();
    };
    return () => {
      playback.close();
      channel.current = null;
    };
  }, []);
  useEffect(() => {
    setTexture(null);
    setPlaying(false);
    setError("");
    setMuted(false);
    if (!src) return;
    const media = document.createElement("video");
    media.crossOrigin = "anonymous";
    media.playsInline = true;
    media.preload = "metadata";
    media.volume = 0.65;
    const map = new VideoTexture(media);
    map.colorSpace = SRGBColorSpace;
    map.minFilter = LinearFilter;
    map.magFilter = LinearFilter;
    map.generateMipmaps = false;
    video.current = media;
    setTexture(map);
    const state = () => {
      setPlaying(!media.paused && !media.ended);
      setRevision((value) => value + 1);
    };
    const metadata = () => {
      setAspect((media.videoWidth || 16) / (media.videoHeight || 9));
      state();
    };
    const fail = () => {
      setError("This film could not be loaded.");
      setPlaying(false);
    };
    for (const event of ["play", "pause", "ended", "timeupdate"])
      media.addEventListener(event, state);
    media.addEventListener("loadedmetadata", metadata);
    media.addEventListener("error", fail);
    media.src = src;
    return () => {
      for (const event of ["play", "pause", "ended", "timeupdate"])
        media.removeEventListener(event, state);
      media.removeEventListener("loadedmetadata", metadata);
      media.removeEventListener("error", fail);
      media.pause();
      media.removeAttribute("src");
      media.load();
      map.dispose();
      video.current = null;
    };
  }, [src]);
  useEffect(() => {
    if (!active) video.current?.pause();
  }, [active]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) video.current?.pause();
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);
  const toggle = useCallback(async () => {
    const media = video.current;
    if (!media) return;
    if (!media.paused) {
      media.pause();
      return;
    }
    try {
      await media.play();
      channel.current?.postMessage("claim-playback");
      setError("");
    } catch {
      setError("Press play to try again.");
    }
  }, []);
  const toggleMuted = useCallback(() => {
    const media = video.current;
    if (media) {
      media.muted = !media.muted;
      setMuted(media.muted);
    }
  }, []);
  const seek = useCallback((seconds: number) => {
    const media = video.current;
    if (media && Number.isFinite(media.duration)) {
      media.currentTime = Math.max(0, Math.min(media.duration, seconds));
      setRevision((value) => value + 1);
    }
  }, []);
  const getPlayback = () => ({
    position: video.current?.currentTime ?? 0,
    duration: Number.isFinite(video.current?.duration)
      ? video.current!.duration
      : 0,
  });
  return {
    texture,
    playing,
    muted,
    error,
    aspect,
    toggle,
    toggleMuted,
    seek,
    getPlayback,
    revision,
  };
}
