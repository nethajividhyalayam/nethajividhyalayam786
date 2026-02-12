import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send, ExternalLink, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { sendEmail, sendParentCopy, sendFormEmail } from "@/lib/emailjs";
import { openPrintableTemplate, buildEmailMessage } from "@/lib/printTemplate";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getFieldGroups = () => [
    {
      heading: "Contact Details",
      fields: [
        { label: "Full Name", value: formData.name },
        { label: "Email Address", value: formData.email },
        { label: "Phone Number", value: formData.phone || "Not provided" },
      ],
    },
    {
      heading: "Message Details",
      fields: [
        { label: "Subject", value: formData.subject },
        { label: "Message", value: formData.message },
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fieldGroups = getFieldGroups();
      // Send via EmailJS (school)
      sendEmail({
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || "Not provided",
        subject: `Contact Enquiry: ${formData.subject}`,
        message: buildEmailMessage("Contact Us — Send Us a Message", fieldGroups),
      }).catch(console.error);
      // Send thank-you copy to parent/enquirer via EmailJS
      sendParentCopy(formData.email, formData.name, "Contact Enquiry", buildEmailMessage("Contact Us — Send Us a Message", fieldGroups)).catch(console.error);
      // Send rich HTML email with attachment via backend
      sendFormEmail({
        formType: "contact",
        title: "Contact Enquiry",
        subtitle: formData.subject,
        fieldGroups,
        senderName: formData.name,
        senderEmail: formData.email,
      }).catch(console.error);
      setSubmitted(true);
      toast({ title: "Message Sent!", description: "A confirmation copy has been sent to your email." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to send", description: err?.text || "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    openPrintableTemplate({
      title: "Contact Enquiry",
      subtitle: "Send Us a Message",
      fieldGroups: getFieldGroups(),
    });
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">We're Here to Help</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Contact Nethaji Vidyalayam</h1>
          <p className="text-lg text-primary-foreground/80">
            Have questions about admissions, our curriculum, or campus life? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Phone, title: "Call Us Directly", content: "9841594945 / 6380967675", sub: "Mon-Sat, 8:50 AM - 3:30 PM", href: "tel:+919841594945", cta: "Call Now" },
              { icon: Mail, title: "Send an Email", content: "nethajividhyalayam@gmail.com / info@nethajividhyalayam.org", sub: "24-hour response time", href: "mailto:nethajividhyalayam@gmail.com", cta: "Email Us" },
              { icon: MapPin, title: "Visit Campus", content: "5/325, Rajiv Nagar, S.Kolathur Main Road", sub: "S.Kolathur, Kovilambakkam Post, Chennai - 600129", href: "https://www.google.com/maps/dir/?api=1&destination=Nethaji+Vidhyalayam+S.Kolathur+Chennai", cta: "Get Directions" },
            ].map((item, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl shadow-lg text-center card-hover">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-serif text-lg font-bold text-primary mb-2">{item.title}</h3>
                <a href={item.href} className="text-muted-foreground hover:text-accent transition-colors block mb-1">{item.content}</a>
                <p className="text-sm text-muted-foreground mb-4">{item.sub}</p>
                <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-4 py-2 rounded-md font-semibold text-sm hover:bg-accent/90 transition-colors">
                  {item.cta}
                  {item.href.startsWith("http") && <ExternalLink className="h-3 w-3" />}
                </a>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="section-title mb-2">Send Us a Message</h2>
              <p className="text-muted-foreground mb-8">Fill out the form and our team will respond within 24 hours.</p>
              {submitted ? (
                <div className="text-center bg-card p-12 rounded-2xl shadow-lg">
                  <Send className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-bold text-primary mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">Thank you for reaching out. We will respond within 24 hours.</p>
                  <div className="flex gap-3 justify-center mt-6">
                    <Button onClick={handlePrint} variant="outline" className="gap-2">
                      <Printer className="h-4 w-4" /> Print / Download Copy
                    </Button>
                    <Button onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); }} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Full Name *</Label>
                      <Input required name="name" value={formData.name} onChange={handleChange} placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Email Address *</Label>
                      <Input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Phone Number</Label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Mobile number" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Subject *</Label>
                      <Input required name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject of enquiry" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Your Message *</Label>
                    <Textarea required name="message" value={formData.message} onChange={handleChange} placeholder="Your message..." rows={5} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg py-6">
                    {loading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Sending...</> : "Send Message"}
                  </Button>
                </form>
              )}
            </div>

            {/* Map & Hours */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-xl font-bold text-primary mb-4">Visit Our Campus</h3>
                <div className="bg-card p-6 rounded-2xl shadow-lg space-y-3">
                  <p className="font-semibold text-foreground">Nethaji Vidhyalayam</p>
                  <p className="text-muted-foreground text-sm">5/325, Rajiv Nagar, S.Kolathur Main Road,<br />S.Kolathur, Kovilambakkam Post, Chennai - 600129</p>
                  <a href="https://www.google.com/maps/dir/?api=1&destination=Nethaji+Vidhyalayam+S.Kolathur+Chennai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline text-sm font-semibold">
                    Get Directions <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-primary mb-4">We're Open!</h3>
                <div className="bg-card p-6 rounded-2xl shadow-lg">
                  <p className="text-sm text-muted-foreground mb-4">Visit us during office hours or call for appointments.</p>
                  <div className="space-y-3">
                    {[
                      { day: "Mon - Fri", time: "8:50 AM - 3:30 PM" },
                      { day: "Saturday", time: "8:50 AM - 3:30 PM" },
                      { day: "Sunday", time: "Closed" },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span className="font-semibold text-foreground text-sm">{item.day}</span>
                        <span className="text-muted-foreground text-sm">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg h-64">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.4!2d80.1873!3d12.9188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d9e8b4e0f17%3A0x2e2e2e2e2e2e2e2e!2sNethaji%20Vidyalayam!5e0!3m2!1sen!2sin!4v1234567890" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="School Location" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
