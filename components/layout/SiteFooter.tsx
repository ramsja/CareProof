export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} TechHavenLabs · CareProof
          </p>
          <p className="text-xs text-gray-400 text-center">
            Fictional data · No real medical records stored
          </p>
          <p className="text-xs text-gray-500">
            Chain ID 31337 · Hardhat Local Network
          </p>
        </div>
      </div>
    </footer>
  );
}
