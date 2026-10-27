export type VideoWork = {
  id: string;
  title: string;
  category: "Commercials" | "Video edits" | "Motion";
  src: string;
  poster?: string;
  description?: string;
};

// Add supplied, approved videos here. Never present placeholder clips as client work.
export const videoWorks: VideoWork[] = [];
