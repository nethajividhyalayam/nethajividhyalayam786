import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import useScrollToHash from "@/hooks/useScrollToHash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, FileText, CreditCard, ClipboardList } from "lucide-react";

const standards = ["Pre-KG", "LKG", "UKG", "I", "II", "III", "IV", "V"];
const sections = ["A", "B", "C", "D"];

const Admissions = () => {
  useScrollToHash();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"process" | "fees" | "apply">("process");

  // Sync tab with URL hash
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash === "fees") setActiveTab("fees");
    else if (hash === "apply") setActiveTab("apply");
    else if (hash === "process" || hash === "") setActiveTab("process");
  }, [location.hash]);

  // Fee payment state
  const [feeForm, setFeeForm] = useState({ childName: "", standard: "", section: "" });
  const isQrEnabled = feeForm.childName.trim() && feeForm.standard && feeForm.section;

  // Apply Now form state
  const [applyForm, setApplyForm] = useState({
    student_name: "", date_of_birth: "", gender: "", aadhaar_number: "",
    parent_name: "", parent_phone: "", parent_email: "", address: "",
    standard_applying: "", previous_school: "", blood_group: "",
    nationality: "Indian", religion: "", community: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!applyForm.student_name || !applyForm.date_of_birth || !applyForm.gender ||
      !applyForm.aadhaar_number || !applyForm.parent_name || !applyForm.parent_phone ||
      !applyForm.address || !applyForm.standard_applying) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    // Validate Aadhaar (12 digits)
    if (!/^\d{12}$/.test(applyForm.aadhaar_number)) {
      toast({ title: "Invalid Aadhaar", description: "Aadhaar number must be exactly 12 digits.", variant: "destructive" });
      return;
    }

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(applyForm.parent_phone)) {
      toast({ title: "Invalid Phone", description: "Phone number must be exactly 10 digits.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("admission_applications").insert([applyForm]);
    setSubmitting(false);

    if (error) {
      toast({ title: "Submission Failed", description: "Please try again later.", variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Application Submitted!", description: "We will contact you soon." });
    }
  };

  const upiPaymentString = isQrEnabled
    ? `upi://pay?pa=nethajividhyalayam@upi&pn=Nethaji%20Vidhyalayam&tn=Fee%20Payment%20-%20${encodeURIComponent(feeForm.childName)}%20-%20${feeForm.standard}%20${feeForm.section}&cu=INR`
    : "";

  const tabs = [
    { id: "process" as const, label: "Admission Process", icon: ClipboardList },
    { id: "fees" as const, label: "Fee Payment", icon: CreditCard },
    { id: "apply" as const, label: "Apply Now", icon: FileText },
  ];

  return (
    <Layout>
      {/* Banner */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Admissions Overview</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Join the Nethaji Vidyalayam family. A simple, transparent process to begin your child's journey of excellence.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-base transition-colors ${activeTab === tab.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Admission Process */}
          {activeTab === "process" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="section-title text-center mb-8">Admission Process</h2>
              <div className="space-y-8">
                {[
                  { step: "01", title: "Enquiry & Registration", desc: "Visit the school or fill the online application form. Our team will guide you through the process." },
                  { step: "02", title: "Document Submission", desc: "Submit required documents including birth certificate, previous school records, Aadhaar card, and passport-size photos." },
                  { step: "03", title: "Interaction Round", desc: "A brief interaction with the student and parents to understand the child's needs and expectations." },
                  { step: "04", title: "Admission Confirmation", desc: "Upon successful evaluation, admission is confirmed and fee payment details are shared." },
                  { step: "05", title: "Welcome to the Family", desc: "Collect the admission kit, uniform details, and join the Nethaji Vidhyalayam family!" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6 items-start">
                    <div className="w-16 h-16 bg-accent text-accent-foreground rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-primary mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fee Payment */}
          {activeTab === "fees" && (
            <div id="fees" className="max-w-xl mx-auto">
              <h2 className="section-title text-center mb-8">Fee Payment</h2>
              <p className="text-center text-muted-foreground mb-8">
                Fill in your child's details below to generate a UPI QR code for fee payment.
              </p>
              <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                <div className="space-y-2">
                  <Label className="font-semibold">Child's Name *</Label>
                  <Input
                    placeholder="Enter child's full name"
                    value={feeForm.childName}
                    onChange={(e) => setFeeForm({ ...feeForm, childName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Standard *</Label>
                    <Select value={feeForm.standard} onValueChange={(v) => setFeeForm({ ...feeForm, standard: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {standards.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Section *</Label>
                    <Select value={feeForm.section} onValueChange={(v) => setFeeForm({ ...feeForm, section: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* QR Code */}
                <div className={`text-center p-8 rounded-xl border-2 border-dashed transition-all ${isQrEnabled ? "border-accent bg-accent/5" : "border-muted bg-muted/30"}`}>
                  {isQrEnabled ? (
                    <div className="space-y-4">
                      <p className="font-semibold text-primary">Scan QR Code to Pay</p>
                      <div className="inline-block bg-white p-4 rounded-xl shadow-md">
                        <QRCodeSVG value={upiPaymentString} size={200} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feeForm.childName} — Class {feeForm.standard} {feeForm.section}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Use any UPI app (GPay, PhonePe, Paytm) to scan and pay
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <CreditCard className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                      <p className="text-muted-foreground">Fill all fields above to generate QR code</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Apply Now */}
          {activeTab === "apply" && (
            <div id="apply" className="max-w-3xl mx-auto">
              <h2 className="section-title text-center mb-8">Apply Now</h2>
              {submitted ? (
                <div className="text-center bg-card p-12 rounded-2xl shadow-lg">
                  <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-bold text-primary mb-2">Application Submitted!</h3>
                  <p className="text-muted-foreground">Thank you for applying. Our team will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
                  <h3 className="font-serif text-xl font-bold text-primary border-b pb-3">Student Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Student Name *</Label>
                      <Input required value={applyForm.student_name} onChange={(e) => setApplyForm({ ...applyForm, student_name: e.target.value })} placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Date of Birth *</Label>
                      <Input required type="date" value={applyForm.date_of_birth} onChange={(e) => setApplyForm({ ...applyForm, date_of_birth: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Gender *</Label>
                      <Select value={applyForm.gender} onValueChange={(v) => setApplyForm({ ...applyForm, gender: v })}>
                        <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Aadhaar Number *</Label>
                      <Input required value={applyForm.aadhaar_number} onChange={(e) => setApplyForm({ ...applyForm, aadhaar_number: e.target.value.replace(/\D/g, "").slice(0, 12) })} placeholder="12-digit Aadhaar" maxLength={12} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Blood Group</Label>
                      <Select value={applyForm.blood_group} onValueChange={(v) => setApplyForm({ ...applyForm, blood_group: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Standard Applying For *</Label>
                      <Select value={applyForm.standard_applying} onValueChange={(v) => setApplyForm({ ...applyForm, standard_applying: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {standards.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-primary border-b pb-3 pt-4">Parent / Guardian Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Parent/Guardian Name *</Label>
                      <Input required value={applyForm.parent_name} onChange={(e) => setApplyForm({ ...applyForm, parent_name: e.target.value })} placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Phone Number *</Label>
                      <Input required value={applyForm.parent_phone} onChange={(e) => setApplyForm({ ...applyForm, parent_phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit mobile" maxLength={10} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Email</Label>
                      <Input type="email" value={applyForm.parent_email} onChange={(e) => setApplyForm({ ...applyForm, parent_email: e.target.value })} placeholder="email@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Nationality</Label>
                      <Input value={applyForm.nationality} onChange={(e) => setApplyForm({ ...applyForm, nationality: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Religion</Label>
                      <Input value={applyForm.religion} onChange={(e) => setApplyForm({ ...applyForm, religion: e.target.value })} placeholder="Religion" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Community</Label>
                      <Input value={applyForm.community} onChange={(e) => setApplyForm({ ...applyForm, community: e.target.value })} placeholder="Community" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Address *</Label>
                    <Textarea required value={applyForm.address} onChange={(e) => setApplyForm({ ...applyForm, address: e.target.value })} placeholder="Full address" rows={3} />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Previous School</Label>
                    <Input value={applyForm.previous_school} onChange={(e) => setApplyForm({ ...applyForm, previous_school: e.target.value })} placeholder="Previous school name (if any)" />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg py-6">
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Admissions;
