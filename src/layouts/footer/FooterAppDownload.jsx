import FooterLink from "./FooterLink";

export default function FooterAppDownload({ data = {} }) {
  const title = data?.title || "";
  const links = Array.isArray(data?.links) ? data.links : [];

  if (!title && !links.length) return null;

  return (
    <div className="md:py-6 ">
      <div>
        <h2 className="max-w-sm lg:!w-full text-sm font-medium text-white/85">{title}</h2>
        <div className="my-4 flex flex-wrap gap-4 lg:my-6">
          {links.map((app, index) => (
            <FooterLink
              key={app?.label || `app-link-${index}`}
              href={app?.href}
              ariaLabel={app?.label || "App link"}
            >
              <img
                className="h-10 md:h-12 w-auto"
                src={app?.image}
                alt={app?.alt || app?.label || "App"}
              />
            </FooterLink>
          ))}
        </div>
      </div>
    </div>
  );
}
