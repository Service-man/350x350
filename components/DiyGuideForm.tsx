"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveGuideAction } from "@/app/actions/diy";
import { COMPONENT_OPTIONS } from "@/lib/constants/components";
import type { ActionState, DiyGuide, DiyProduct, DiyStep } from "@/lib/types";

const initial: ActionState = { ok: false };

let uid = 0;
const key = () => `row-${uid++}`;

type StepRow = DiyStep & { _k: string };
type ProductRow = { _k: string; title: string; amazon_url: string; approx_price: string; description: string };

export function DiyGuideForm({ guide }: { guide?: DiyGuide }) {
  const [state, action, pending] = useActionState(saveGuideAction, initial);

  const [steps, setSteps] = useState<StepRow[]>(
    (guide?.steps?.length ? guide.steps : [{ title: "", detail: "" }]).map((s) => ({ ...s, _k: key() }))
  );
  const [products, setProducts] = useState<ProductRow[]>(
    (guide?.products?.length ? guide.products : ([{ title: "", amazon_url: "", approx_price: "", description: "" }] as Partial<DiyProduct>[])).map(
      (p) => ({ _k: key(), title: p.title ?? "", amazon_url: p.amazon_url ?? "", approx_price: p.approx_price ?? "", description: p.description ?? "" })
    )
  );

  return (
    <form action={action} className="space-y-6">
      {guide?.id ? <input type="hidden" name="id" value={guide.id} /> : null}
      <input type="hidden" name="published_at" value={guide?.published_at ?? ""} />

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="label mb-1.5">Title</span>
            <input className="field" name="title" defaultValue={guide?.title ?? ""} required placeholder="Clean and lube your chain" />
          </label>
          <label className="block">
            <span className="label mb-1.5">Slug (optional)</span>
            <input className="field" name="slug" defaultValue={guide?.slug ?? ""} placeholder="clean-and-lube-your-chain" />
          </label>
        </div>
        <label className="block">
          <span className="label mb-1.5">Summary</span>
          <textarea className="field" name="summary" rows={2} defaultValue={guide?.summary ?? ""} placeholder="One or two sentences shown on the DIY index." />
        </label>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="label mb-1.5">Difficulty</span>
            <select className="field" name="difficulty" defaultValue={guide?.difficulty ?? "easy"}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
          <label className="block">
            <span className="label mb-1.5">Est. time</span>
            <input className="field" name="estimated_time" defaultValue={guide?.estimated_time ?? ""} placeholder="20–30 min" />
          </label>
          <label className="block">
            <span className="label mb-1.5">Component (optional)</span>
            <select className="field" name="component" defaultValue={guide?.component ?? ""}>
              <option value="">—</option>
              {COMPONENT_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="label mb-1.5">Brand</span>
              <input className="field" name="brand" defaultValue={guide?.brand ?? ""} placeholder="Any" />
            </label>
            <label className="block">
              <span className="label mb-1.5">Model</span>
              <input className="field" name="model" defaultValue={guide?.model ?? ""} placeholder="Any" />
            </label>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className="label">Steps</span>
          <button type="button" className="text-[12.5px] font-bold text-leaf" onClick={() => setSteps((s) => [...s, { title: "", detail: "", _k: key() }])}>
            + Add step
          </button>
        </div>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={step._k} className="rounded-lg border border-stone-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase text-lavmute">Step {i + 1}</span>
                {steps.length > 1 ? (
                  <button type="button" className="text-[12px] font-bold text-danger" onClick={() => setSteps((s) => s.filter((r) => r._k !== step._k))}>
                    Remove
                  </button>
                ) : null}
              </div>
              <input className="field mb-2" name="step_title" defaultValue={step.title} placeholder="Step title" />
              <textarea className="field" name="step_detail" rows={2} defaultValue={step.detail} placeholder="What to do" />
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className="label">Amazon product links</span>
          <button
            type="button"
            className="text-[12.5px] font-bold text-leaf"
            onClick={() => setProducts((p) => [...p, { _k: key(), title: "", amazon_url: "", approx_price: "", description: "" }])}
          >
            + Add product
          </button>
        </div>
        <p className="mb-3 text-[12px] text-steel">Paste the full Amazon product URL (including your Associates tag). A product needs a name and a link to be saved.</p>
        <div className="space-y-3">
          {products.map((product, i) => (
            <div key={product._k} className="rounded-lg border border-stone-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase text-lavmute">Product {i + 1}</span>
                <button type="button" className="text-[12px] font-bold text-danger" onClick={() => setProducts((p) => p.filter((r) => r._k !== product._k))}>
                  Remove
                </button>
              </div>
              <div className="grid gap-2 md:grid-cols-[1fr_140px]">
                <input className="field" name="product_title" defaultValue={product.title} placeholder="Product name" />
                <input className="field" name="product_price" defaultValue={product.approx_price} placeholder="₹350–₹600" />
              </div>
              <input className="field mt-2" name="product_url" defaultValue={product.amazon_url} placeholder="https://www.amazon.in/dp/…?tag=yourtag-21" />
              <input className="field mt-2" name="product_desc" defaultValue={product.description} placeholder="Short note (optional)" />
            </div>
          ))}
        </div>
      </section>

      {state.error ? <p className="rounded border border-danger/40 bg-red-50 p-3 text-sm text-danger">{state.error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" name="status" value="published" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Publish"}
        </button>
        <button className="btn-secondary" name="status" value="draft" type="submit" disabled={pending}>
          Save as draft
        </button>
        <Link className="text-[13px] font-bold text-steel hover:text-ink" href="/admin/diy">Cancel</Link>
      </div>
    </form>
  );
}
