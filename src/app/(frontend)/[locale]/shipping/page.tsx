import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Shipping Policy" };

export default function ShippingPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Shipping Policy" />
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 prose-fk">
          <p>
            We ship orders across Kosovo and Albania using temperature-controlled logistics
            appropriate for pharmaceutical and biological products.
          </p>
          <h2>Delivery times</h2>
          <p>
            Standard orders are typically delivered within 24–48 hours of confirmation,
            depending on your clinic&rsquo;s location and stock availability. Device and
            equipment orders are scheduled individually after your quote is confirmed.
          </p>
          <h2>Storage in transit</h2>
          <p>
            Temperature-sensitive products are shipped with appropriate cold-chain packaging.
            Please inspect your delivery on arrival and contact us immediately if packaging
            appears compromised.
          </p>
          <p>
            <em>
              This page is a general placeholder and should be reviewed and confirmed against
              your actual logistics provider and delivery timelines before the site goes live.
            </em>
          </p>
        </div>
      </section>
    </>
  );
}
