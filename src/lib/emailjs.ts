import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_22njwgl";
const TEMPLATE_ID = "template_weovigq";
const PUBLIC_KEY = "wOmqeaIENzeXh5eA8";

export const sendEmail = (templateParams: Record<string, string>) => {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
};
