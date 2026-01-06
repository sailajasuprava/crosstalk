import prisma from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) return Response.json(null, { status: 400 });

  const config = await prisma.localizationConfig.findUnique({
    where: { shop },
  });

  return Response.json(config);
};
