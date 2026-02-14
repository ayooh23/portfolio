import Link from "next/link";
import ImageTrail from "@/components/effects/ImageTrail";

const trailImages = [
  "/images/thumb_br-ndpeople.jpg",
  "/images/thumb_do.jpg",
  "/images/thumb_stroll.jpg",
  "/images/thumb_dms.png",
  "/images/thumb_tiny.jpeg",
  "/images/ayu.jpg",
];

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-200 px-6"
    >
      <ImageTrail images={trailImages} threshold={72} />

      <div data-no-trail className="relative z-10 max-w-2xl px-6 py-4 text-center">
        <h1 className="sr-only">Page not found</h1>
        <p className="text-balance font-sans text-2xl leading-tight text-gray-900 sm:text-3xl md:text-4xl">
          Page not found.
          <br />
          <Link
            href="/"
            className="underline decoration-[0.08em] underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:ring-1 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
          >
            Follow Ayu back home.
          </Link>
        </p>
      </div>
    </main>
  );
}
