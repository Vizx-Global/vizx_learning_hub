import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = {
    platform: [
      { label: "Learning Paths", href: "/browse" },
      { label: "Interactive Games", href: "/games" },
      { label: "Leaderboards", href: "/leaderboard" }
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" }
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "Contact", href: "/contact" },
      { label: "Documentation", href: "/docs" }
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/vizxacademy", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/vizxacademy", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/vizxacademy", label: "LinkedIn" }
  ];

  const contactInfo = [
    { icon: Mail, text: "info@vizxglobal.com", href: "mailto:info@vizxglobal.com" },
    { icon: Phone, text: "+254769360360", href: "tel:+254769360360" },
    { icon: MapPin, text: "Nairobi Kenya", href: "https://maps.google.com" }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img src="https://res.cloudinary.com/dvkt0lsqb/image/upload/v1767653109/vizx_academy_upy2x1.jpg" alt="Vizx Academy Logo" className="h-10 w-auto mb-4" />
            <p className="text-muted-foreground text-sm mb-4">AI-powered learning platform for modern workforce development.</p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-300" aria-label={social.label}><social.icon className="w-4 h-4" /></a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Platform</h3>
            <ul className="space-y-2">{footerLinks.platform.map((link) => (<li key={link.label}><Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">{link.label}</Link></li>))}</ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Company</h3>
            <ul className="space-y-2">{footerLinks.company.map((link) => (<li key={link.label}><Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">{link.label}</Link></li>))}</ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Support</h3>
            <ul className="space-y-2">{footerLinks.support.map((link) => (<li key={link.label}><Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">{link.label}</Link></li>))}</ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              {contactInfo.map((contact, index) => (
                <a key={index} href={contact.href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"><contact.icon className="w-4 h-4 flex-shrink-0" /><span>{contact.text}</span></a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Vizx Academy. All rights reserved.</p>
            <div className="flex gap-4">
              {footerLinks.legal.map((link) => (<Link key={link.label} to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300">{link.label}</Link>))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;