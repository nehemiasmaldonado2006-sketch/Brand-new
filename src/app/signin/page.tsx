import { signIn } from "@/auth";
import { Header } from "@/components/Header";

export default function SignInPage() {
  return (
    <>
      <Header title="Sign in" showBack />
      <main className="flex flex-col items-center gap-6 px-11 py-20 text-center">
        <div className="font-serif text-[34px] leading-none">Connect your Google account</div>
        <div className="max-w-md text-[13px] leading-[1.6] text-muted">
          Mission Control reads your Gmail inbox and Google Calendar to power Email Desk and
          Calendar &amp; Time. Nothing is sent anywhere else.
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="cursor-pointer border-none bg-ink px-6 py-3.5 font-sans text-[11px] tracking-[0.16em] text-page uppercase hover:bg-accent"
          >
            Sign in with Google
          </button>
        </form>
      </main>
    </>
  );
}
