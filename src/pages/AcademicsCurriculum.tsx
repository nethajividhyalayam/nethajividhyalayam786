import { Link } from "react-router-dom";
import { BookOpen, Heart, Globe, Zap, ChevronRight } from "lucide-react";
import useScrollToHash from "@/hooks/useScrollToHash";

const AcademicsCurriculum = () => {
  useScrollToHash();

  const pillars = [
    { icon: BookOpen, title: "Academic Rigor", desc: "Challenging, research-based curriculum aligned with CBSE standards." },
    { icon: Heart, title: "Character Development", desc: "Emphasis on values, ethics, and social responsibility." },
    { icon: Globe, title: "Global Perspective", desc: "Exposure to diverse cultures, languages, and worldviews." },
    { icon: Zap, title: "Skill-Based Learning", desc: "Focus on critical thinking, creativity, and problem-solving." },
  ];

  const stages = [
    {
      title: "Foundational Stage (Pre-KG)",
      subjects: "Play-based Learning, Phonics, Basic Numeracy, Motor Skills",
      link: "/academics/nursery",
    },
    {
      title: "Preparatory Stage (LKG)",
      subjects: "Core Subjects (Languages, Math, EVS), Discovery Learning, Reading Habits",
      link: "/academics/nursery",
    },
    {
      title: "Middle Stage (UKG)",
      subjects: "Subject Specialization (Science, Social Studies), Critical Thinking, Project Work",
      link: "/academics/nursery",
    },
    {
      title: "Secondary Stage (Grade 1 to 5)",
      subjects: "Core Academics, Life Skills, Holistic Growth",
      link: "/academics/primary",
    },
  ];

  return (
    <>
      {/* Banner */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(var(--accent)) 0%, #c0392b 30%, #8e44ad 70%, #6c3483 100%)" }}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('/photos/academics/classroom-learning.jpg')] bg-cover bg-center" />
        <div className="container-custom text-center relative z-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
            Nethaji Vidhyalayam Curriculum
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            A Modern, Holistic Approach to Education
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-3xl text-center">
          <div className="inline-block bg-accent/10 text-accent font-semibold uppercase tracking-wider text-xs px-4 py-1.5 rounded-full mb-4">
            Educational Philosophy
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">Learning for Life</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our curriculum is designed to foster critical thinking, creativity, and a global mindset through
            innovative teaching methodologies and value-based education.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our approach is student-centered, inquiry-based, and rooted in the principles of constructivism.
            We aim to cultivate lifelong learners who are curious, compassionate, and confident.
          </p>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Foundation</p>
            <h2 className="section-title">Four Pillars of Our Curriculum</h2>
            <p className="text-muted-foreground">Education that balances intellect, emotion, and ethics.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <p.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-serif font-bold text-primary mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Structure */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Structure</p>
            <h2 className="section-title">Curriculum Structure</h2>
            <p className="text-muted-foreground">Comprehensive coverage across all grade levels.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {stages.map((s, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-md border border-border hover:border-accent transition-colors group">
                <h3 className="font-serif font-bold text-primary mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{s.subjects}</p>
                <Link
                  to={s.link}
                  className="inline-flex items-center gap-1 text-accent font-semibold text-sm hover:gap-2 transition-all"
                >
                  View Details <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Framework */}
      <section className="section-padding bg-secondary">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold mb-2 uppercase tracking-wider text-sm">Evaluation</p>
            <h2 className="section-title">Assessment Framework</h2>
            <p className="text-muted-foreground">Continuous evaluation for holistic growth.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-card rounded-2xl p-6 shadow-md text-center">
              <div className="text-5xl font-bold text-accent mb-2">40%</div>
              <h3 className="font-serif font-bold text-primary mb-1">Formative Assessment</h3>
              <p className="text-sm text-muted-foreground">Quizzes, Projects, Class Participation</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-md text-center">
              <div className="text-5xl font-bold text-primary mb-2">60%</div>
              <h3 className="font-serif font-bold text-primary mb-1">Summative Assessment</h3>
              <p className="text-sm text-muted-foreground">Mid-Term & Final Exams</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-md">
            <h4 className="font-serif font-bold text-primary mb-4">Key Assessment Features</h4>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                "Activity-based learning",
                "Worksheets and projects",
                "Periodic assessments",
                "Continuous observation and feedback",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground text-center">
        <div className="container-custom max-w-2xl">
          <h2 className="font-serif text-3xl font-bold mb-4">Want to Know More?</h2>
          <p className="text-primary-foreground/80 mb-8">
            Download our detailed curriculum handbook for a comprehensive overview of grade-wise syllabi,
            learning outcomes, and teaching methodologies.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-full font-bold hover:bg-accent/90 transition-colors"
          >
            Contact Us for Details
          </a>
        </div>
      </section>
    </>
  );
};

export default AcademicsCurriculum;
