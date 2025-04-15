import  Index  from "@/components/grids/Index";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0">
        <Index />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <SignUp  />
      </div>
    </div>
  );
}