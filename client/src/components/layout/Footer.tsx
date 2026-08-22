export default function Footer() {
    return (
        <footer className="border-t border-ink-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-ink-500 sm:flex-row sm:justify-between sm:text-left">
                <p>
                    © {new Date().getFullYear()} Gemma's Kitchenette. Home-cooked, block by
                    block.
                </p>
                <p className="text-ink-400">Made fresh, served daily.</p>
            </div>
        </footer>
    );
}
