import Layout from "@/components/layout/Layout";

const calendarMonths = [
  { month: "June 2025", events: [{ date: "1", title: "School Reopens" }, { date: "5", title: "Orientation Day" }, { date: "21", title: "International Yoga Day" }] },
  { month: "July 2025", events: [{ date: "4", title: "Science Week Begins" }, { date: "15", title: "Parent-Teacher Meet" }, { date: "28", title: "Talent Show" }] },
  { month: "August 2025", events: [{ date: "15", title: "Independence Day" }, { date: "20", title: "Inter-house Quiz" }, { date: "26", title: "Sports Week Begins" }] },
  { month: "September 2025", events: [{ date: "5", title: "Teachers' Day" }, { date: "15", title: "Half-Yearly Exams Begin" }, { date: "28", title: "Results Day" }] },
  { month: "October 2025", events: [{ date: "2", title: "Gandhi Jayanti" }, { date: "10-18", title: "Dussehra / Diwali Holidays" }, { date: "25", title: "School Resumes" }] },
  { month: "November 2025", events: [{ date: "5", title: "Children's Day Celebrations" }, { date: "14", title: "Children's Day" }, { date: "20", title: "Annual Day Rehearsals" }] },
  { month: "December 2025", events: [{ date: "1", title: "Annual Day" }, { date: "15", title: "Christmas Celebrations" }, { date: "22-31", title: "Winter Holidays" }] },
  { month: "January 2026", events: [{ date: "2", title: "School Reopens" }, { date: "14", title: "Pongal Celebrations" }, { date: "26", title: "Republic Day & Sports Day" }] },
  { month: "February 2026", events: [{ date: "1", title: "Science Exhibition" }, { date: "14", title: "Valentine's Week Activities" }, { date: "20", title: "Pre-Board Exams" }] },
  { month: "March 2026", events: [{ date: "1-15", title: "Annual Exams" }, { date: "20", title: "Results Day" }, { date: "25", title: "Farewell Day" }] },
  { month: "April 2026", events: [{ date: "1", title: "Summer Holidays Begin" }, { date: "14", title: "Tamil New Year" }] },
  { month: "May 2026", events: [{ date: "1", title: "May Day" }, { date: "15", title: "Summer Camp (Optional)" }, { date: "31", title: "Summer Holidays End" }] },
];

const SchoolCalendar = () => {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">School Calendar</h1>
          <p className="text-lg text-primary-foreground/80">Academic Year 2025–2026</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calendarMonths.map((monthData, idx) => (
              <div key={idx} className="bg-card rounded-2xl shadow-lg overflow-hidden card-hover animate-fade-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="bg-accent text-accent-foreground px-6 py-4">
                  <h3 className="font-serif text-xl font-bold">{monthData.month}</h3>
                </div>
                <div className="p-6 space-y-3">
                  {monthData.events.map((event, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded min-w-[40px] text-center flex-shrink-0">
                        {event.date}
                      </span>
                      <p className="text-sm text-foreground font-medium">{event.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SchoolCalendar;
