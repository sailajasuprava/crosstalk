import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import "@shopify/polaris/build/esm/styles.css";
import { useLoaderData } from "react-router";

import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Box,
  Button,
  Select,
} from "@shopify/polaris";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return Response.json({
    shop: session.shop,
    appId: process.env.SHOPIFY_APP_ID,
    appHandle: "crosstalk-localization", // Hardcode or from env
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
  const { shop, appId } = useLoaderData();

  const handleEnableEmbed = () => {
    if (!shop) {
      console.error("Shop is missing");
      return;
    }

    const storeHandle = shop.replace(".myshopify.com", "");

    const extensionHandle = "crosstalk-localization"; // theme extension folder name
    const activateAppId = `app-embed-block-id://${appId}/${extensionHandle}`;

    const url = `https://admin.shopify.com/store/${storeHandle}/themes/current/editor?context=apps&activateAppId=${encodeURIComponent(
      activateAppId,
    )}`;

    window.open(
      `https://${shop}/admin/themes/current/editor?context=apps`,
      "_blank",
    );
    // window.open(url, "_top");
  };

  return (
    <Page title="Dashboard">
      <Layout>
        {/* 1. Dashboard banner (screenshot 3) */}
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd"></Text>
                </BlockStack>
                {/* <Select
                  label="Selected Language"
                  labelHidden
                  options={[
                    { label: "Select Language", value: "select" },
                    { label: "English", value: "en" },
                    { label: "French", value: "fr" },
                  ]}
                  value="select"
                  onChange={() => {}}
                /> */}
              </InlineStack>

              <Box
                padding="400"
                background="bg-surface-warning"
                borderRadius="200"
              >
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    Get Started! Enable the App
                  </Text>
                  <Text as="p">
                    Get setup in 10 seconds! Click the button below to enable
                    the app embed in your theme, and remember to click save.
                  </Text>
                  <InlineStack>
                    <Button
                      variant="primary"
                      size="large"
                      onClick={handleEnableEmbed}
                    >
                      Enable App Embed
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
