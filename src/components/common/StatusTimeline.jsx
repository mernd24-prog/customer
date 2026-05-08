const ORDER_STEPS = ["pending_payment", "confirmed", "packed", "shipped", "delivered", "fulfilled"];

export default function StatusTimeline({ status }) {
  const activeIndex = ORDER_STEPS.indexOf(status);
  return (
    <ol className="timeline">
      {ORDER_STEPS.map((step, index) => (
        <li className={index <= activeIndex ? "done" : ""} key={step}>
          <span />
          {step.replaceAll("_", " ")}
        </li>
      ))}
    </ol>
  );
}
