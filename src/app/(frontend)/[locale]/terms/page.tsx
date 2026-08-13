import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" />
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 prose-fk">
          <p>
            These terms govern your use of fillers-ks.com and any orders placed through it.
            By creating an account or placing an order, you agree to the terms below.
          </p>
          <h2>Professional use only</h2>
          <p>
            Products listed on this site are intended exclusively for licensed medical
            doctors, dermatologists and certified aesthetic practitioners. We reserve the
            right to verify your professional license before approving an account or order.
          </p>
          <h2>Orders and pricing</h2>
          <p>
            Product prices, availability and specifications are subject to change without
            notice. Device and equipment listings marked &ldquo;Request a Quote&rdquo; are
            priced individually based on your clinic&rsquo;s requirements.
          </p>
          <h2>Liability</h2>
          <p>
            Products must be stored, handled and administered according to the
            manufacturer&rsquo;s official instructions. Fillers Kosovo is not liable for
            outcomes resulting from improper storage, handling or administration.
          </p>
          <p>
            <em>
              This page is a general placeholder and should be reviewed by a legal
              professional before the site goes live.
            </em>
          </p>
        </div>
      </section>
    </>
  );
}
