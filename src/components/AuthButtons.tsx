import { signIn, signOut } from "@/auth";

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="cursor-pointer border-none bg-accent px-4 py-2.5 font-sans text-[10.5px] tracking-[0.14em] text-white uppercase hover:bg-header-fg hover:text-ink"
      >
        Connect Google — Gmail &amp; Calendar
      </button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="cursor-pointer border-none bg-transparent p-0 font-sans text-[11px] tracking-[0.14em] text-header-fg/55 uppercase hover:text-accent"
      >
        Disconnect
      </button>
    </form>
  );
}
