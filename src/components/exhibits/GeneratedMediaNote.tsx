import Image from "next/image";

type SharedProps = {
  title: string;
  description: string;
};

type VideoProps = SharedProps & {
  kind: "video";
  src: string;
  poster: string;
  duration: string;
};

type ImageProps = SharedProps & {
  kind: "image";
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type GeneratedMediaNoteProps = VideoProps | ImageProps;

/**
 * A deliberately secondary home for generated media. The live exhibit remains
 * the technical evidence; this panel is a labelled visual analogy learners can
 * choose to inspect after working through the exact model.
 */
export function GeneratedMediaNote(props: GeneratedMediaNoteProps) {
  return (
    <figure className="mt-12 overflow-hidden border-y border-line bg-raised sm:grid sm:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)] sm:items-center">
      <div className="relative aspect-video overflow-hidden bg-sunken">
        {props.kind === "video" ? (
          <video
            className="h-full w-full object-cover"
            controls
            muted
            playsInline
            preload="metadata"
            poster={props.poster}
            aria-label={`${props.title}, a silent generated visual metaphor`}
          >
            <source src={props.src} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={props.src}
            alt={props.alt}
            width={props.width}
            height={props.height}
            sizes="(max-width: 640px) 100vw, 67vw"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <figcaption className="p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">
          Generated visual metaphor{props.kind === "video" ? ` · silent · ${props.duration}` : ""}
        </p>
        <h3 className="mt-3 text-lg font-semibold text-ink">{props.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{props.description}</p>
        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          Use the live experiment above for exact behavior and measurements.
        </p>
      </figcaption>
    </figure>
  );
}
