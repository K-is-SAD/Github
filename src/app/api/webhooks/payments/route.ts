import crypto from "crypto";
import { console } from "inspector";

export async function POST(req: Request) {
  
  try {
    // Catch the event type
    const clonedReq = req.clone();
    const eventType = req.headers.get("X-Event-Name");
    const body = await req.json();

    // Check signature..directly from dcoumentation ..no need to undertsand 
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SIGNATURE;
    if (!secret) {
      throw new Error("Webhook signature secret is not defined.");
    }
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(
      hmac.update(await clonedReq.text()).digest("hex"),
      "utf8"
    );
    const signature = Buffer.from(req.headers.get("X-Signature") || "", "utf8");

    if (!crypto.timingSafeEqual(digest, signature)) {
      throw new Error("Invalid signature.");
    }
    
    console.log(body);

    // Logic according to event
    if (eventType === "order_created") {
      const userId = body.meta.custom_data.user_id; 
      const isSuccessful = body.data.attributes.status === "paid";
      console.log(
        `Order created for user ${userId}. Payment status: ${isSuccessful}`)
    }

    return Response.json({ message: "Webhook received" });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}