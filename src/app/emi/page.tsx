"use client";

import { UploadModal } from "@/components/upload-modal";
import { useState } from "react";
import { EMIData } from "../actions/extract-emi-data";

export default function Page() {
  const [emiData, setEMIData] = useState<EMIData | null>(null);

  console.log(emiData);

  return (
    <div>
      {/* <EMIForm /> */}
      <UploadModal maxSize={2 * 1024 * 1024} setEMIData={setEMIData} />
    </div>
  );
}
