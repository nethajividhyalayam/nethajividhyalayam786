import emailjs from "@emailjs/browser";
import { supabase } from "@/integrations/supabase/client";

const SERVICE_ID = "service_22njwgl";
const TEMPLATE_ID = "template_weovigq";
const PUBLIC_KEY = "wOmqeaIENzeXh5eA8";

export const sendEmail = (templateParams: Record<string, string>) => {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
};

interface FieldGroup {
  heading: string;
  fields: { label: string; value: string }[];
}

interface FormEmailOptions {
  formType: "contact" | "admission" | "fee_payment" | "career";
  title: string;
  subtitle?: string;
  fieldGroups: FieldGroup[];
  senderName: string;
  senderEmail?: string;
  receiptDetails?: {
    referenceId: string;
    paymentMethod: string;
    amount?: string;
  };
}

// Send rich HTML email to school + thank-you copy to parent via edge function
export const sendFormEmail = async (options: FormEmailOptions) => {
  const { data, error } = await supabase.functions.invoke("send-form-email", {
    body: options,
  });
  if (error) throw error;
  return data;
};
