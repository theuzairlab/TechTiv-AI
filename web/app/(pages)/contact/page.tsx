import type { Metadata } from "next";
import { ContactPageView } from "@/components/pages/contact/contact-page-view";

export const metadata: Metadata = {
  title: "Contact & Consultation",
  description:
    "Book a consultation, talk to our AI consultant, schedule a strategy call, or request a custom automation proposal.",
};

export default function ContactPage() {
  return <ContactPageView />;
}
