import type { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy — Somae",
  description:
    "How Somae collects, uses, stores and protects your information when you use the Somae website and product.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
