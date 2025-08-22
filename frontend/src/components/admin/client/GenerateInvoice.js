import React, { useState, useEffect } from "react";

import InvoiceForm from "../../invoice/InvoiceForm";

import InvoicePreview from "../../invoice/InvoicePreview";
 
export default function GenerateInvoice() {

  const [invoiceData, setInvoiceData] = useState(null);

  const [isClient, setIsClient] = useState(false);
 
  useEffect(() => {

    setIsClient(true);

  }, []);
 
  const handleGenerateInvoice = (data) => {

    setInvoiceData(data);

  };
 
  return (
<main className="bg-gray-100 min-h-screen py-10 px-4">

      {!invoiceData ? (
<InvoiceForm onSubmit={handleGenerateInvoice} />

      ) : (

        isClient && <InvoicePreview data={invoiceData} />

      )}
</main>

  );

}

 