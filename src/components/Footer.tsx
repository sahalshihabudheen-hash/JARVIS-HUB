import { useAdmin } from "@/context/AdminContext";

const Footer = () => {
  const { branding } = useAdmin();

  return (
    <footer className="mt-16 py-8 border-t border-border">
      <div className="container mx-auto px-4 text-center space-y-2">
        <p className="text-muted-foreground/60 text-xs flex justify-center items-center gap-2">
          <span>{branding.copyrightText}</span>
          <span>|</span>
          <span>{branding.poweredBy}</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
