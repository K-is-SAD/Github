"use client";

import Index from "@/components/sidebar/Index";
import React from "react";
import Grid from "@/components/grids/Index";
import { AuthGuard } from "@/components/auth-guard";

const page = () => {
  return (
    <AuthGuard>
      <div className="w-full relative">
        <div>
          <Grid />
        </div>
        <div className="absolute inset-0 top-20">
          <Index />
        </div>
      </div>
    </AuthGuard>
  );
};

export default page;
