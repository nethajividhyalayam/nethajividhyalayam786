import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Send,
  Clock
} from "lucide-react";
import logo from "@/assets/nethaji_logo.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "About Us", path: "/about" },
    { label: "Admissions", path: "/admissions" },
    { label: "Academics", path: "/academics" },
    { label: "Facilities", path: "/facilities" },
    { label: "Gallery", path: "/gallery" },
    { label: "Events", path: "/events" },
    { label: "Career", path: "/career" },
    { label: "Contact Us", path: "/contact" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Nethaji Vidhyalayam Logo" className="w-12 h-12 object-contain" />
              <div>
                <h3 className="font-serif font-bold text-lg">Nethaji Vidhyalayam</h3>
                <p className="text-xs text-primary-foreground/70">Nurturing Tomorrow's Leaders</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Nethaji Vidhyalayam is committed to providing quality education that nurtures 
              young minds and prepares them for a bright future. Established on 7th June 2001, we have 
              been a beacon of academic excellence.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-sm text-primary-foreground/80">
                  5/325, Rajiv Nagar, S.Kolathur Main Road,<br />
                  S.Kolathur, Kovilambakkam Post, Chennai - 600129
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" />
                <a 
                  href="tel:+919841594945" 
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  9841594945 / 6380967675
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" />
                <a 
                  href="mailto:nethajividhyalayam@gmail.com" 
                  className="text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  nethajividhyalayam@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm text-primary-foreground/80">
                  Mon - Sat: 8:50 AM - 3:30 PM
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-6">Newsletter</h4>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Subscribe to our newsletter for updates on events, admissions, and more.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 pr-12"
                />
                <Button 
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-accent hover:bg-accent/90 h-8 w-8"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            {/* FeeDesk Link */}
            <div className="mt-6 p-4 bg-accent/20 rounded-lg">
              <p className="text-sm font-medium mb-2">Pay School Fees Online</p>
              <Link
                to="/feedesk"
                className="inline-flex items-center gap-2 text-accent hover:underline text-sm"
              >
                Visit FeeDesk Portal →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/70 text-center md:text-left">
            © {currentYear} Nethaji Vidhyalayam. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-primary-foreground/70 hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-primary-foreground/70 hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
