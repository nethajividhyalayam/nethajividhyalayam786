import Layout from "@/components/layout/Layout";
import { Calendar, MapPin, Clock } from "lucide-react";

const events = [
  { title: "Annual Day Celebration", date: "March 15, 2025", time: "9:00 AM - 4:00 PM", location: "School Auditorium", description: "A grand celebration showcasing student talents through performances, awards, and cultural programs.", image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop", status: "Upcoming" },
  { title: "Science Exhibition", date: "February 20, 2025", time: "10:00 AM - 2:00 PM", location: "Science Lab & Hall", description: "Students present innovative science projects and experiments to judges and parents.", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=400&fit=crop", status: "Upcoming" },
  { title: "Sports Day", date: "January 26, 2025", time: "8:00 AM - 5:00 PM", location: "School Ground", description: "Inter-house sports competitions featuring track events, team sports, and prize distribution.", image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&h=400&fit=crop", status: "Completed" },
  { title: "Parent-Teacher Meeting", date: "January 10, 2025", time: "10:00 AM - 1:00 PM", location: "Respective Classrooms", description: "Interactive session for parents and teachers to discuss student progress.", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop", status: "Completed" },
  { title: "Christmas & Pongal Celebrations", date: "December 22, 2024", time: "9:00 AM - 12:00 PM", location: "School Campus", description: "Festive celebrations with cultural performances, rangoli, and traditional activities.", image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=400&fit=crop", status: "Completed" },
  { title: "Independence Day Celebration", date: "August 15, 2024", time: "8:00 AM - 11:00 AM", location: "School Ground", description: "Flag hoisting ceremony followed by patriotic performances and speeches.", image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&h=400&fit=crop", status: "Completed" },
];

const Events = () => {
  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Events</h1>
          <p className="text-lg text-primary-foreground/80">Celebrating achievements and creating memories</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="space-y-8">
            {events.map((event, index) => (
              <div key={index} className="bg-card rounded-2xl overflow-hidden shadow-lg card-hover flex flex-col md:flex-row animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="md:w-1/3 relative overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-56 md:h-full object-cover hover:scale-110 transition-transform duration-500" />
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${event.status === "Upcoming" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                    {event.status}
                  </span>
                </div>
                <div className="md:w-2/3 p-8">
                  <h3 className="font-serif text-2xl font-bold text-primary mb-3">{event.title}</h3>
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-accent" /> {event.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-accent" /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-accent" /> {event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
