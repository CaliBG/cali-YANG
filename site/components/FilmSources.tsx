import { asset } from "@/lib/asset";

const alternatives = {
  "collaboration-film.mp4": "collaboration-film-2e8433a155.mp4",
  "tongkuang-film.mp4": "tongkuang-film-6ebc22c5a3.mp4",
  "vanod-brand-film-v4.mp4": "vanod-brand-film-v4-43d6411552.mp4",
} as const;

/** Let the native player choose its supported codec before downloading media. */
export default function FilmSources({name, original, onFallbackError}:{name:keyof typeof alternatives; original:string; onFallbackError:()=>void}) {
  return <>
    <source src={asset("/media/films/" + alternatives[name])} type={'video/mp4; codecs="hvc1, mp4a.40.2"'} />
    <source src={original} type="video/mp4" onError={onFallbackError} />
  </>;
}
