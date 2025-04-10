import Index from "@/components/sidebar/Index";
import React from "react";
import Grid from "@/components/grids/Index";

const page = () => {
  return (
    <div className="w-full relative">
      <div>
        <Grid />
      </div>
      <div className="absolute inset-0 top-20">
        <Index />
      </div>
    </div>
  );
};

export default page;
