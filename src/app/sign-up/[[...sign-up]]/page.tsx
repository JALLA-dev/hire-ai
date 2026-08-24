import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "1rem", background: "var(--bg-deep, #0b0f17)" }}>
      <SignUp />
    </div>
  );
}
