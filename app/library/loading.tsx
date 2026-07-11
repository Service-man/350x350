import { LoadingState } from "@/components/LoadingState";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <LoadingState label="Loading the bike library..." />
    </div>
  );
}
