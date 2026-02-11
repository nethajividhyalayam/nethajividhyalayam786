import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_22njwgl";
const TEMPLATE_ID = "template_weovigq";
const PUBLIC_KEY = "wOmqeaIENzeXh5eA8";

// Send to school (default template recipient)
export const sendEmail = (templateParams: Record<string, string>) => {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
};

// Send thank-you copy to parent/enquirer via EmailJS
// NOTE: Your EmailJS template must have {{to_email}} in the "To Email" field for this to work
export const sendParentCopy = (parentEmail: string, parentName: string, formTitle: string, message: string) => {
  if (!parentEmail || !parentEmail.includes("@")) return Promise.resolve();
  
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email: parentEmail,
    from_name: "Nethaji Vidhyalayam",
    from_email: "nethajividhyalayam@gmail.com",
    phone: "+91 9841594945 / 6380967675",
    subject: `Thank you ${parentName} — ${formTitle} | Nethaji Vidhyalayam`,
    message: `Dear ${parentName},\n\nThank you for your ${formTitle.toLowerCase()}. We have received your submission and our team will get back to you shortly.\n\nBelow is a copy of your submission for your records:\n\n${"=".repeat(40)}\n\n${message}\n\n${"=".repeat(40)}\n\nNethaji Vidhyalayam\n5/325, Rajiv Nagar, S.Kolathur Main Road, S.Kolathur, Kovilambakkam Post, Chennai - 600129\nPhone: +91 9841594945 / 6380967675\nEmail: nethajividhyalayam@gmail.com\n\nThis is a computer-generated email. Please do not reply.`,
  }, { publicKey: PUBLIC_KEY });
};
