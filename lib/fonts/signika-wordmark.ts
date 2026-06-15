import { Signika } from "next/font/google";

/** Sidebar wordmark only — do not add to root layout. */
export const signikaWordmark = Signika({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});
