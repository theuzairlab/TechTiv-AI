import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { PagesChrome } from "@/components/shared/pages-chrome";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PagesChrome>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </PagesChrome>
  );
}
