import { PageHero } from "@/components/PageHero";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-10 prose-fk">
          <p>
            Fillers Kosovo (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This
            page explains, in general terms, what information we collect through this website
            and how it is used.
          </p>
          <h2>Information we collect</h2>
          <p>
            When you create a partner account, submit the contact form, or subscribe to our
            newsletter, we collect the details you provide — such as your name, clinic name,
            email address and phone number — solely to respond to your inquiry, verify your
            professional status, and process orders.
          </p>
          <h2>How we use your information</h2>
          <p>
            We use your information to operate your account, fulfil orders, respond to
            support requests, and — only if you opt in — send you product and promotional
            updates. We do not sell your personal data to third parties.
          </p>
          <h2>Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at
            any time by contacting us using the details on our Contact page.
          </p>
          <p>
            <em>
              This page is a general placeholder and should be reviewed by a legal professional
              before the site goes live, to ensure full compliance with applicable data
              protection law.
            </em>
          </p>
        </div>
      </section>
    </>
  );
}
