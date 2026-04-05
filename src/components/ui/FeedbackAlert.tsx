type FeedbackVariant = "success" | "error" | "info";

type FeedbackAlertProps = {
  message: string;
  variant?: FeedbackVariant;
};

const variantClasses: Record<FeedbackVariant, string> = {
  success: "border-emerald-800 bg-emerald-950/30 text-emerald-100",
  error: "border-red-800 bg-red-950/30 text-red-100",
  info: "border-zinc-700 bg-zinc-900 text-zinc-100",
};

export default function FeedbackAlert({
  message,
  variant = "info",
}: FeedbackAlertProps) {
  return (
    <section
      className={`rounded-2xl border px-4 py-3 text-sm ${variantClasses[variant]}`}
    >
      {message}
    </section>
  );
}