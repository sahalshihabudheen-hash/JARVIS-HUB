import { useAdmin } from "@/context/AdminContext";

const Footer = () => {
  const { branding } = useAdmin();

  return (
    <footer className="mt-20 py-12 border-t border-white/5">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col items-center gap-4">
           <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">
             {branding.copyrightText} • {branding.poweredBy}
           </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
