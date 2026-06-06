import type { Metadata } from "next";
import { SiteNav } from "@/components/SiteChrome";
import { RequestAccessClient } from "@/components/RequestAccessClient";

export const metadata: Metadata = {
  title: "Request Access",
  description:
    "Request access to AURELEAN for supplier intelligence, RFQ orchestration, and procurement operating memory."
};

export default function RequestAccessPage() {
  return (
    <>
      <SiteNav />
      <RequestAccessClient />
    </>
  );
}
