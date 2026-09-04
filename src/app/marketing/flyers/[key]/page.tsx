import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";
import { getFlyer } from "@/lib/marketing/flyers";
import { sendFlyerToClient } from "@/app/marketing/actions";

export const dynamic = "force-dynamic";

export default async function FlyerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ sent?: string; sendError?: string }>;
}) {
  const { key } = await params;
  const sp = await searchParams;
  const flyer = getFlyer(key);
  if (!flyer) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  return (
    <>
      <Header
        title={flyer.name}
        showBack
        status={userId ? `Connected as ${session!.user!.email}` : "No sources connected"}
        authSlot={userId ? <SignOutButton /> : <SignInButton />}
      />
      <main className="grid grid-cols-[1fr_360px] items-start gap-6 px-11 pt-7 pb-[60px]">
        <div className="flex flex-col gap-4 border border-black/[0.12] bg-panel p-6">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="font-serif text-[28px] leading-none">{flyer.name}</div>
              <div className="mt-1.5 text-[12px] text-muted">
                {flyer.tag} · {flyer.agent}
                {flyer.address ? ` · ${flyer.address}` : ""}
              </div>
            </div>
            <a
              href={flyer.src}
              download
              className="flex-none cursor-pointer border border-ink bg-transparent px-4 py-2.5 font-sans text-[10px] tracking-[0.14em] text-ink uppercase hover:bg-ink hover:text-page"
            >
              Download
            </a>
          </div>
          <div className="relative mx-auto aspect-[1224/1584] w-full max-w-[520px] overflow-hidden bg-header">
            <Image src={flyer.src} alt={flyer.name} fill className="object-cover" sizes="520px" />
          </div>
        </div>

        <aside className="flex flex-col gap-4 border border-black/[0.12] bg-panel p-6">
          <div className="text-[10px] tracking-[0.16em] text-muted uppercase">Send to client</div>
          {sp.sent && (
            <div className="border border-accent bg-accent/[0.07] px-3.5 py-3 text-[12.5px] text-ink">
              Sent.
            </div>
          )}
          {sp.sendError && (
            <div className="border border-black/25 bg-black/[0.03] px-3.5 py-3 text-[12.5px] text-muted">
              Couldn&apos;t send: {sp.sendError}
            </div>
          )}
          {userId ? (
            <form action={sendFlyerToClient} className="flex flex-col gap-3.5">
              <input type="hidden" name="key" value={flyer.key} />
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.16em] text-muted uppercase">
                  Client email
                </label>
                <input
                  name="to"
                  type="email"
                  required
                  placeholder="name@email.com"
                  className="border border-black/25 bg-transparent px-3 py-2.5 text-[14px] text-ink"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.16em] text-muted uppercase">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  defaultValue="Attached is the flyer we discussed — happy to walk you through it."
                  className="border border-black/25 bg-transparent px-3 py-2.5 text-[14px] text-ink"
                />
              </div>
              <button
                type="submit"
                className="cursor-pointer border-none bg-ink px-3 py-3 font-sans text-[11px] tracking-[0.16em] text-page uppercase hover:bg-accent"
              >
                Send
              </button>
            </form>
          ) : (
            <div className="text-[12.5px] leading-[1.6] text-muted">
              Sign in with Google to send this flyer from your own Gmail.
            </div>
          )}
        </aside>
      </main>
    </>
  );
}
