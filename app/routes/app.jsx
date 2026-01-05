import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export const action = async ({ request }) => {
  // 1. Authenticate & get shop
  const { session } = await authenticate.admin(request);
  const shop = session.shop; // myshop.myshopify.com

  // 2. Read form data
  const formData = await request.formData();

  const websiteUrl = formData.get("websiteUrl");
  const language = formData.get("language");
  const currency = formData.get("currency");
  const country = formData.get("country");
  const position = formData.get("position");

  // 3. Save to Prisma (upsert = create or update)
  const config = await prisma.localizationConfig.upsert({
    where: { shop },
    update: {
      websiteUrl,
      language,
      currency,
      country,
      position,
    },
    create: {
      shop,
      websiteUrl,
      language,
      currency,
      country,
      position,
    },
  });

  return { success: true, config };
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Home</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
