import { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `About - ${SITE_NAME}`,
  description: `Learn more about ${SITE_NAME} — insights, trends, and strategies for modern finance and growth.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">About {SITE_NAME}</h1>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-text-secondary">
        <p>
          {SITE_NAME} is your go-to destination for insights, trends, and strategies
          in modern finance and growth. We publish in-depth articles, analysis, and
          guides to help you navigate the evolving landscape of personal finance,
          investing, and wealth building.
        </p>

        <p>
          Our team of writers and analysts bring diverse expertise across financial
          markets, technology, entrepreneurship, and economic policy. Every article
          is researched, fact-checked, and designed to give you actionable knowledge.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-text-primary">Our Mission</h2>
        <p>
          We believe financial literacy is a fundamental skill. Our mission is to
          democratize access to high-quality financial insights that were previously
          available only to industry insiders. Whether you&apos;re just starting
          your investment journey or managing a complex portfolio, {SITE_NAME} has
          something for you.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-text-primary">What We Cover</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Market analysis and investment strategies</li>
          <li>Personal finance and wealth building</li>
          <li>Technology trends shaping finance</li>
          <li>Economic policy and its impact on markets</li>
          <li>Entrepreneurship and business growth</li>
          <li>Cryptocurrency and digital assets</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-text-primary">Get in Touch</h2>
        <p>
          Have a question, suggestion, or want to contribute?
          Reach out to us at{" "}
          <a
            href="mailto:hello@gainciti.com"
            className="text-primary-600 hover:text-primary-700 transition-colors"
          >
            hello@gainciti.com
          </a>
        </p>
      </div>
    </div>
  );
}
