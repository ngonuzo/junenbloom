import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readStore } from "@/lib/db/store";
import { ProductDetail } from "@/components/site/ProductDetail";

export const dynamic = "force-dynamic";

function findBoard(slug: string) {
  const store = readStore();
  const product = store.products.find(
    (p) => p.slug === slug && p.type === "board" && p.status !== "hidden" && p.status !== "archived"
  );
  return { store, product };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { product } = findBoard(slug);
  if (!product) return {};
  const cover = product.images?.[0];
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: cover
      ? { images: [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] }
      : undefined,
  };
}

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { store, product } = findBoard(slug);
  if (!product) notFound();
  return <ProductDetail product={product} store={store} />;
}
