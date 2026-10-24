import { notFound } from "next/navigation";

/** Routes unknown paths to the site's own not-found page, inside the header and footer. */
export default function CatchAll() {
  notFound();
}
