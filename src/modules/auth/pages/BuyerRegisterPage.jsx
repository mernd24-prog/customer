import AuthCard from "../../../components/ui/AuthCard";
import Seo from "../../../components/ui/Seo";
import BuyerRegisterForm from "../components/BuyerRegisterForm";
import useBuyerRegister from "../controllers/useBuyerRegister";

export default function BuyerRegisterPage() {
  const { error, loading, registerBuyer } = useBuyerRegister();

  return (
    <>
      <Seo
        title="Buyer Registration ||| Sam Global"
        description="Create a Sam Global buyer account."
      />
      <AuthCard
        eyebrow="Registration"
        title="Start Shopping With a Customer A   ccount."
        subtitle="Your role is locked to buyer on submit, so this form cannot accidentally create a seller or admin profile."
        icon="/image/png/person.png"
        image="/image/png/authImg1.png"
        maxWidth="max-w-[1220px]"
      >
        <BuyerRegisterForm
          error={error}
          loading={loading}
          onSubmit={registerBuyer}
        />
      </AuthCard>
    </>
  );
}
