import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { openPrintableTemplate } from "@/lib/printTemplate";
import {
  LogOut, Users, CreditCard, FileText, PlusCircle, Search,
  Printer, DollarSign, BarChart3, BookOpen, Loader2
} from "lucide-react";

const standards = ["Pre-KG", "LKG", "UKG", "I", "II", "III", "IV", "V"];
const sections = ["A", "B", "C", "D"];

const FeeDesk = () => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Students
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStandard, setSelectedStandard] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Fee payment
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", term: "", payment_method: "Cash", reference_id: "", notes: "" });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Add student
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ admission_number: "", student_name: "", standard: "", section: "A", parent_name: "", parent_phone: "", date_of_birth: "", gender: "" });

  // Payments history
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchRole(session.user.id);
      }
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
    setRole(data?.role || null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome!", description: "Logged in successfully." });
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  // Fetch students
  useEffect(() => {
    if (user && role) fetchStudents();
  }, [user, role]);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("*").eq("status", "active").order("standard").order("student_name");
    if (!error && data) setStudents(data);
  };

  const fetchPayments = async () => {
    const { data, error } = await supabase.from("fee_payments").select("*, students(student_name, standard, section)").order("created_at", { ascending: false }).limit(100);
    if (!error && data) setPayments(data);
  };

  useEffect(() => {
    if (user && role) fetchPayments();
  }, [user, role]);

  const filteredStudents = students.filter((s) => {
    const matchStd = selectedStandard === "All" || s.standard === selectedStandard;
    const matchSearch = s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.admission_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStd && matchSearch;
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.admission_number || !newStudent.student_name || !newStudent.standard) {
      toast({ title: "Missing Fields", description: "Fill required fields.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("students").insert([newStudent]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Student Added!" });
      setShowAddStudent(false);
      setNewStudent({ admission_number: "", student_name: "", standard: "", section: "A", parent_name: "", parent_phone: "", date_of_birth: "", gender: "" });
      fetchStudents();
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !paymentForm.amount || !paymentForm.term) {
      toast({ title: "Missing Fields", description: "Select student, enter amount and term.", variant: "destructive" });
      return;
    }
    setPaymentLoading(true);
    const { data, error } = await supabase.from("fee_payments").insert([{
      student_id: selectedStudent.id,
      amount: parseFloat(paymentForm.amount),
      term: paymentForm.term,
      payment_method: paymentForm.payment_method,
      reference_id: paymentForm.reference_id || null,
      notes: paymentForm.notes || null,
      recorded_by: user.id,
    }]).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment Recorded!", description: `Receipt: ${data.receipt_number}` });
      // Print receipt
      openPrintableTemplate({
        title: "Fee Payment Receipt",
        subtitle: `${selectedStudent.student_name} — Class ${selectedStudent.standard} ${selectedStudent.section}`,
        fieldGroups: [
          { heading: "Student Details", fields: [
            { label: "Name", value: selectedStudent.student_name },
            { label: "Admission No", value: selectedStudent.admission_number },
            { label: "Standard", value: selectedStudent.standard },
            { label: "Section", value: selectedStudent.section },
          ]},
          { heading: "Payment Details", fields: [
            { label: "Receipt No", value: data.receipt_number },
            { label: "Term", value: paymentForm.term },
            { label: "Amount", value: `₹${paymentForm.amount}` },
            { label: "Method", value: paymentForm.payment_method },
            { label: "Reference ID", value: paymentForm.reference_id || "N/A" },
            { label: "Date", value: new Date().toLocaleDateString("en-IN") },
          ]},
        ],
        receiptMode: true,
        receiptDetails: { referenceId: data.receipt_number, paymentMethod: paymentForm.payment_method, amount: paymentForm.amount },
      });
      setPaymentForm({ amount: "", term: "", payment_method: "Cash", reference_id: "", notes: "" });
      setSelectedStudent(null);
      fetchPayments();
    }
    setPaymentLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-primary">FeeDesk</h1>
            <p className="text-muted-foreground mt-2">Nethaji Vidhyalayam — Staff Login</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@example.com" required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loginLoading}>
              {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // No role assigned
  if (!role) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="font-serif text-2xl font-bold text-primary mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">Your account does not have a role assigned. Contact the administrator.</p>
          <Button onClick={handleLogout} variant="outline">Log Out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6" />
          <h1 className="font-serif text-xl font-bold">FeeDesk — Nethaji Vidhyalayam</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm bg-accent/20 px-3 py-1 rounded-full capitalize">{role}</span>
          <Button onClick={handleLogout} variant="ghost" size="sm" className="text-primary-foreground hover:text-accent">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      <div className="container-custom py-6">
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="bg-background shadow-sm rounded-xl p-1 flex-wrap h-auto">
            <TabsTrigger value="students" className="gap-2"><Users className="h-4 w-4" /> Students</TabsTrigger>
            <TabsTrigger value="collect-fee" className="gap-2"><CreditCard className="h-4 w-4" /> Collect Fee</TabsTrigger>
            <TabsTrigger value="payments" className="gap-2"><FileText className="h-4 w-4" /> Payments</TabsTrigger>
            {role === "admin" && <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4" /> Reports</TabsTrigger>}
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <div className="bg-background rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="font-serif text-2xl font-bold text-primary">Students List</h2>
                <div className="flex gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9 w-48" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Standards</SelectItem>
                      {standards.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowAddStudent(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Student
                  </Button>
                </div>
              </div>

              {/* Add student form */}
              {showAddStudent && (
                <form onSubmit={handleAddStudent} className="bg-secondary p-6 rounded-xl mb-6 space-y-4">
                  <h3 className="font-semibold text-lg">Add New Student</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1"><Label>Admission No *</Label><Input value={newStudent.admission_number} onChange={(e) => setNewStudent({ ...newStudent, admission_number: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Student Name *</Label><Input value={newStudent.student_name} onChange={(e) => setNewStudent({ ...newStudent, student_name: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Standard *</Label>
                      <Select value={newStudent.standard} onValueChange={(v) => setNewStudent({ ...newStudent, standard: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{standards.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Section</Label>
                      <Select value={newStudent.section} onValueChange={(v) => setNewStudent({ ...newStudent, section: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Parent Name</Label><Input value={newStudent.parent_name} onChange={(e) => setNewStudent({ ...newStudent, parent_name: e.target.value })} /></div>
                    <div className="space-y-1"><Label>Parent Phone</Label><Input value={newStudent.parent_phone} onChange={(e) => setNewStudent({ ...newStudent, parent_phone: e.target.value })} /></div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Student</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
                  </div>
                </form>
              )}

              {/* Students table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-semibold">Adm. No</th>
                      <th className="p-3 font-semibold">Name</th>
                      <th className="p-3 font-semibold">Standard</th>
                      <th className="p-3 font-semibold">Section</th>
                      <th className="p-3 font-semibold">Parent</th>
                      <th className="p-3 font-semibold">Phone</th>
                      <th className="p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No students found. Add students to get started.</td></tr>
                    ) : filteredStudents.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-secondary/50 transition-colors">
                        <td className="p-3 font-mono text-xs">{s.admission_number}</td>
                        <td className="p-3 font-semibold">{s.student_name}</td>
                        <td className="p-3">{s.standard}</td>
                        <td className="p-3">{s.section}</td>
                        <td className="p-3">{s.parent_name || "—"}</td>
                        <td className="p-3">{s.parent_phone || "—"}</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => { setSelectedStudent(s); document.querySelector('[data-value="collect-fee"]')?.dispatchEvent(new Event('click', { bubbles: true })); }}>
                            <DollarSign className="h-3 w-3" /> Pay Fee
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Total: {filteredStudents.length} students</p>
            </div>
          </TabsContent>

          {/* Collect Fee Tab */}
          <TabsContent value="collect-fee">
            <div className="bg-background rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
              <h2 className="font-serif text-2xl font-bold text-primary mb-6">Collect Fee Payment</h2>

              {/* Student selector */}
              <div className="space-y-2 mb-6">
                <Label className="font-semibold">Select Student</Label>
                <Select value={selectedStudent?.id || ""} onValueChange={(v) => setSelectedStudent(students.find((s) => s.id === v) || null)}>
                  <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.admission_number} — {s.student_name} ({s.standard} {s.section})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStudent && (
                <div className="bg-secondary p-4 rounded-xl mb-6">
                  <p className="font-semibold">{selectedStudent.student_name}</p>
                  <p className="text-sm text-muted-foreground">Class {selectedStudent.standard} {selectedStudent.section} | Adm: {selectedStudent.admission_number}</p>
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Term *</Label>
                    <Select value={paymentForm.term} onValueChange={(v) => setPaymentForm({ ...paymentForm, term: v })}>
                      <SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term 1">Term 1</SelectItem>
                        <SelectItem value="Term 2">Term 2</SelectItem>
                        <SelectItem value="Term 3">Term 3</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Amount (₹) *</Label>
                    <Input type="number" placeholder="5000" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Payment Method</Label>
                    <Select value={paymentForm.payment_method} onValueChange={(v) => setPaymentForm({ ...paymentForm, payment_method: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Reference ID</Label>
                    <Input placeholder="Transaction ref" value={paymentForm.reference_id} onChange={(e) => setPaymentForm({ ...paymentForm, reference_id: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Notes</Label>
                  <Input placeholder="Optional notes" value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} />
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={paymentLoading}>
                  {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                  Record Payment & Print Receipt
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Payments History Tab */}
          <TabsContent value="payments">
            <div className="bg-background rounded-2xl shadow-lg p-6">
              <h2 className="font-serif text-2xl font-bold text-primary mb-6">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-semibold">Receipt</th>
                      <th className="p-3 font-semibold">Student</th>
                      <th className="p-3 font-semibold">Class</th>
                      <th className="p-3 font-semibold">Term</th>
                      <th className="p-3 font-semibold">Amount</th>
                      <th className="p-3 font-semibold">Method</th>
                      <th className="p-3 font-semibold">Date</th>
                      <th className="p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No payments recorded yet.</td></tr>
                    ) : payments.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-secondary/50 transition-colors">
                        <td className="p-3 font-mono text-xs">{p.receipt_number}</td>
                        <td className="p-3 font-semibold">{p.students?.student_name || "—"}</td>
                        <td className="p-3">{p.students?.standard} {p.students?.section}</td>
                        <td className="p-3">{p.term}</td>
                        <td className="p-3 font-semibold text-accent">₹{p.amount}</td>
                        <td className="p-3">{p.payment_method}</td>
                        <td className="p-3">{new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                        <td className="p-3">
                          <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => {
                            openPrintableTemplate({
                              title: "Fee Payment Receipt",
                              subtitle: `${p.students?.student_name} — Class ${p.students?.standard} ${p.students?.section}`,
                              fieldGroups: [
                                { heading: "Payment Details", fields: [
                                  { label: "Receipt No", value: p.receipt_number },
                                  { label: "Term", value: p.term },
                                  { label: "Amount", value: `₹${p.amount}` },
                                  { label: "Method", value: p.payment_method },
                                  { label: "Date", value: new Date(p.payment_date).toLocaleDateString("en-IN") },
                                ]},
                              ],
                              receiptMode: true,
                              receiptDetails: { referenceId: p.receipt_number, paymentMethod: p.payment_method, amount: String(p.amount) },
                            });
                          }}>
                            <Printer className="h-3 w-3" /> Print
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab (Admin only) */}
          {role === "admin" && (
            <TabsContent value="reports">
              <div className="bg-background rounded-2xl shadow-lg p-6">
                <h2 className="font-serif text-2xl font-bold text-primary mb-6">Reports & Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-secondary rounded-xl p-6 text-center">
                    <Users className="h-8 w-8 text-accent mx-auto mb-3" />
                    <p className="text-3xl font-bold text-primary">{students.length}</p>
                    <p className="text-muted-foreground">Total Students</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-6 text-center">
                    <CreditCard className="h-8 w-8 text-accent mx-auto mb-3" />
                    <p className="text-3xl font-bold text-primary">{payments.length}</p>
                    <p className="text-muted-foreground">Total Payments</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-6 text-center">
                    <DollarSign className="h-8 w-8 text-accent mx-auto mb-3" />
                    <p className="text-3xl font-bold text-primary">₹{payments.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString("en-IN")}</p>
                    <p className="text-muted-foreground">Total Collected</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-6">More detailed reports (income, expense, cash flow, daily reports, student summary, staff summary) will be available in upcoming updates.</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default FeeDesk;
