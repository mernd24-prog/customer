import {
  WhatsappShareButton,
  FacebookShareButton,
  TwitterShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  EmailShareButton,
  WhatsappIcon,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  LinkedinIcon,
  EmailIcon,
} from "react-share";

export default function ShareProductPopover({ productTitle }) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareItems = [
    {
      Button: WhatsappShareButton,
      Icon: WhatsappIcon,
      props: {
        url: shareUrl,
        title: productTitle,
      },
    },
    {
      Button: FacebookShareButton,
      Icon: FacebookIcon,
      props: {
        url: shareUrl,
        quote: productTitle,
      },
    },
    {
      Button: TwitterShareButton,
      Icon: TwitterIcon,
      props: {
        url: shareUrl,
        title: productTitle,
      },
    },
    {
      Button: TelegramShareButton,
      Icon: TelegramIcon,
      props: {
        url: shareUrl,
        title: productTitle,
      },
    },
    {
      Button: LinkedinShareButton,
      Icon: LinkedinIcon,
      props: {
        url: shareUrl,
        title: productTitle,
      },
    },
    {
      Button: EmailShareButton,
      Icon: EmailIcon,
      props: {
        url: shareUrl,
        subject: productTitle,
        body: `Check this product:\n${shareUrl}`,
      },
    },
  ];

  return (
    <div className="absolute right-0 top-12 z-50 w-[230px] max-w-[calc(100vw-24px)] rounded-[var(--customer-radius)] border border-border bg-white p-3 shadow-2xl sm:w-[260px] sm:p-4 md:w-[280px]">
      <div className="mb-3">
        <h3 className="text-[13px] font-bold text-ink sm:text-sm">
          Share Product
        </h3>
        <p className="mt-1 text-[11px] text-muted sm:text-xs">
          Share this product with friends
        </p>
      </div>

      <div className="grid grid-cols-3 place-items-center gap-2 sm:gap-3">
        {shareItems.map(({ Button, Icon, props }, index) => (
          <Button key={index} {...props}>
            <span className="block scale-[0.85] transition-all duration-300 ease-in-out sm:scale-95 md:scale-100">
              <Icon size={42} round />
            </span>
          </Button>
        ))}
      </div>

      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(shareUrl);
          alert("Link copied!");
        }}
        className="mt-4 w-full rounded-full bg-gold px-3 py-2 text-[12px] font-semibold text-white transition-all duration-300 ease-in-out hover:bg-gold-dark sm:px-4 sm:text-sm"
      >
        Copy Link
      </button>
    </div>
  );
}
