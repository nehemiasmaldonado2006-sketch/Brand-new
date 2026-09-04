import { Header } from "@/components/Header";
import { EmptyNote } from "@/components/ui";

export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <>
      <Header title={title} showBack />
      <main className="flex flex-col gap-6 px-11 pt-7 pb-[60px]">
        <div className="font-serif text-[34px] leading-none text-muted">Building next</div>
        <EmptyNote>{note}</EmptyNote>
      </main>
    </>
  );
}
