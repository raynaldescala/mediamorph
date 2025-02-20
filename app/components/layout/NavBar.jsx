import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import ThemeSwitcher from "../ui/theme-switcher";

const NavBar = () => {
    return (
        <>
            <header className="flex items-center justify-between py-4">
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2"
                >
                    <Image src="/logo.svg" alt="logo" width={24} height={24} />
                    <h2 className="text-xl font-semibold">
                        Media<span className="text-primary">Morph</span>
                    </h2>
                </Link>
                <nav>
                    <ul className="flex items-center justify-items-center gap-4">
                        <li>
                            <Button asChild variant="link">
                                <Link href="/">Home</Link>
                            </Button>
                        </li>
                        <li>
                            <Button asChild variant="link">
                                <Link href="/about">About</Link>
                            </Button>
                        </li>
                        <li>
                            <Button asChild variant="link">
                                <Link href="/privacy">Privacy</Link>
                            </Button>
                        </li>
                        <li className="flex">
                            <ThemeSwitcher />
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    );
};

export default NavBar;
