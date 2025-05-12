export const dynamic = "force-dynamic"; //no caching
import { lemonsqueezyApiInstance } from "@/payments/lemonsqueezy";
//import { NextRequest,NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Debug API key (remove in production)
    console.log("API Key available:", !!process.env.LEMON_SQUEEZY_API_KEY);

    const reqData = await req.json();
    if (!reqData.productId) {
      return new Response(JSON.stringify({ error: "productId is required" }), {
        status: 400,
      });
    }

    const response = await lemonsqueezyApiInstance.post("/checkouts", {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              //add the data from the request to the custom data
              userId: "123",
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: process.env.LEMON_SQUEEZY_STORE_ID?.toString(),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: reqData.productId.toString(),
            },
          },
        },
      },
    });
    const checkoutUrl = response.data.data.attributes.url;

    console.log("Response from lemonsqueezy", response.data);
    return new Response(JSON.stringify({ checkoutUrl }), { status: 200 });
  } catch (e) {
    console.log("Error in purchaseProduct route", e);
    return new Response(
      JSON.stringify({ error: "Error in purchaseProduct route" }),
      { status: 500 }
    );
  }
}
