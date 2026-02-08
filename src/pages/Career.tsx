import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Users, Award, Heart, Send, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Career = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: "Application Received!", description: "We will review your application and contact you soon." });
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-lg text-primary-foreground/80">Shape the future with us at Nethaji Vidyalayam.</p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <h2 className="section-title text-center mb-12">Why Join Nethaji Vidhyalayam?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Briefcase, title: "Growth Opportunities", desc: "Professional development and career advancement programs" },
              { icon: Users, title: "Collaborative Culture", desc: "Work with passionate educators and supportive staff" },
              { icon: Award, title: "Competitive Salary", desc: "Attractive compensation with benefits and bonuses" },
              { icon: Heart, title: "Work-Life Balance", desc: "Supportive policies for a healthy work-life balance" },
            ].map((item, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl shadow-lg text-center card-hover">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-serif font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Inquiry Form */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl">
          <h2 className="section-title text-center mb-8">Career Inquiry Form</h2>
          {submitted ? (
            <div className="text-center bg-card p-12 rounded-2xl shadow-lg">
              <Send className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-primary mb-2">Application Submitted!</h3>
              <p className="text-muted-foreground">We will review your application and contact you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
              <h3 className="font-serif text-xl font-bold text-primary border-b pb-3">Personal Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Name of the Applicant *</Label>
                  <Input required placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Date of Birth *</Label>
                  <Input required type="date" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Gender</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground italic">* Current openings are for female candidates only as per school policy.</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Email ID *</Label>
                  <Input required type="email" placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Contact Number *</Label>
                  <Input required placeholder="10-digit mobile" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-semibold">Address</Label>
                  <Textarea placeholder="Full address" rows={2} />
                </div>
              </div>

              <h3 className="font-serif text-xl font-bold text-primary border-b pb-3 pt-4">Academic & Professional Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Academic Qualification *</Label>
                  <Input required placeholder="Highest qualification" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Professional Degree *</Label>
                  <Input required placeholder="e.g. B.Ed, M.Ed" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Current Position (If any)</Label>
                  <Input placeholder="Current role" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Position Applying For</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teaching">Teaching</SelectItem>
                      <SelectItem value="non-teaching">Non-Teaching</SelectItem>
                      <SelectItem value="admin">Office Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Experience</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select Experience Level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresher">Fresher</SelectItem>
                      <SelectItem value="less-1">Less than 1 year</SelectItem>
                      <SelectItem value="1-5">1–5 years</SelectItem>
                      <SelectItem value="5+">Above 5 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg py-6">
                Submit Application
              </Button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Career;
