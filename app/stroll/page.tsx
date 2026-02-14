import { permanentRedirect } from "next/navigation";

export default function StrollRedirectPage() {
  permanentRedirect("/?tile=stroll");
}
