const extrapages = [
  {
    labels: "Privacy Policy",
    links: "/privacy-policy",
  },
  {
    labels: "Terms of Use",
    links: "/terms-of-use",
  },
  {
    labels: "Cookie Settings",
    links: "/cookie-settings",
  },
  {
    labels: "Sitemap",
    links: "#",
  },
];


export default function FooterBottomBar({ copyright = "", socialLinks = [] }) {
  return (
    <section className=" bg-black py-4">
      <div className=" flex flex-col gap-2 lg:gap-10 text-white  text-xs md:text-base lg:flex-row justify-center">
        <p className="text-center">
          © 2026 Samglobal Marketplace Pvt. Ltd. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {extrapages.map((item, index) => (
            <a key={index} href={item.links} className="">
              {item.labels}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
