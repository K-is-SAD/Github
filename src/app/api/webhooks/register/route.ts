/* eslint-disable @typescript-eslint/no-explicit-any */
import {Webhook} from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import  User  from '@/models/User';

export async function POST(req : NextRequest){
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if(!WEBHOOK_SECRET){
      throw new Error('Missing WEBHOOK_SECRET environment variable');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if(!svix_id ||!svix_timestamp ||!svix_signature){
    return NextResponse.json({success : false, message : "No svix headers"}, {status : 200})
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  console.log(payload);
  console.log("Webhook body", body);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt : WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id" : svix_id, 
      "svix-timestamp" : svix_timestamp, 
      "svix-signature" : svix_signature,
    }) as WebhookEvent;

  } catch (error : any) {
    console.log("Failed to verify webhook", error);
    return NextResponse.json({success : false, message : error.message}, {status : 200})
  }

  const eventType = evt.type;

  if(eventType === 'user.created'){
    try {
      console.log("EVENT DATA on SESSION CREATED! : ", evt.data);
      const {id, email_addresses, first_name, last_name, username, image_url} = evt.data;
      const primaryemail = email_addresses[0].email_address;
      if(!primaryemail){
        return NextResponse.json({success : false, message : "No primary email address found"}, {status : 200})
      }

      const createduser = new User({
        clerkId : id,
        email : primaryemail,
        name : (first_name ? first_name : "") + " " + (last_name ? last_name : ""),
        username : username,
        avatar : image_url
      })
      await createduser.save();
      console.log("User created successfully", createduser);

      return NextResponse.json({success : true, message : "User created successfully"}, {status : 200})

    } catch (error : any) {
      return NextResponse.json({success : false, message : error.message}, {status : 500})
    }
  }

  return NextResponse.json({success : true, message : "Webhook received successfully"}, {status : 200})

}