import { defineArrayMember, defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "pricing", title: "Pricing & Inventory" },
    { name: "media", title: "Media" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().min(2).max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Beanies", value: "beanies" },
          { title: "Scarves", value: "scarves" },
          { title: "Scrunchies", value: "scrunchies" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required().min(20).max(220),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      group: "pricing",
      validation: (rule) => rule.required().positive().precision(2),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      group: "pricing",
      initialValue: "GBP",
      options: {
        list: [
          { title: "GBP", value: "GBP" },
          { title: "USD", value: "USD" },
          { title: "EUR", value: "EUR" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "inventory",
      title: "Inventory",
      type: "number",
      group: "pricing",
      description: "Set to 0 to mark as out of stock.",
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      group: "pricing",
      validation: (rule) => rule.required().regex(/^[A-Z0-9_-]{3,40}$/),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "content",
      initialValue: false,
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (rule) => rule.required().min(3).max(120),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      group: "seo",
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "status",
      media: "images.0",
      price: "price",
      currency: "currency",
    },
    prepare(selection) {
      const { title, subtitle, media, price, currency } = selection;
      const formattedPrice =
        typeof price === "number" ? `${currency || "GBP"} ${price.toFixed(2)}` : "No price";
      return {
        title,
        subtitle: `${formattedPrice} • ${subtitle || "draft"}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Updated (newest)",
      name: "updatedDesc",
      by: [{ field: "_updatedAt", direction: "desc" }],
    },
    {
      title: "Price (low to high)",
      name: "priceAsc",
      by: [{ field: "price", direction: "asc" }],
    },
  ],
});
