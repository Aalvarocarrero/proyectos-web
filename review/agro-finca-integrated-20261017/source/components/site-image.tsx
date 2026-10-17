import Image, { type ImageProps } from "next/image";

/** Serve pre-compressed assets directly so they also work from the offline cache. */
export function SiteImage({ alt, ...props }: ImageProps) {
  return <Image {...props} alt={alt} unoptimized />;
}
