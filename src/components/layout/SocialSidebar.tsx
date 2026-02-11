import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";

const socials = [
  { icon: Facebook, href: "https://www.facebook.com/", label: "Facebook", bg: "bg-[#1877F2]" },
  { icon: Twitter, href: "https://x.com/home", label: "X / Twitter", bg: "bg-[#000000]" },
  { icon: Youtube, href: "https://www.youtube.com/", label: "YouTube", bg: "bg-[#FF0000]" },
  { icon: Instagram, href: "https://www.instagram.com/", label: "Instagram", bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743]" },
];

const SocialSidebar = () => {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-0.5">
      {socials.map(({ icon: Icon, href, label, bg }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`group flex items-center ${bg} text-white w-10 hover:w-36 transition-all duration-300 overflow-hidden rounded-l-lg shadow-lg`}
        >
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <span className="whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-3">
            {label}
          </span>
        </a>
      ))}
    </div>
  );
};

export default SocialSidebar;
