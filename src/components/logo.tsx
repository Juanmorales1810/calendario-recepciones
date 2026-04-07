export default function Logo() {
    return (
        <>
            <img
                src="/disei-logo.webp"
                alt="Logo"
                width={100}
                height={32}
                className="mr-2 w-28 dark:hidden"
            />
            <img
                src="/disei-logo-white.webp"
                alt="Logo oscuro"
                width={32}
                height={32}
                className="mr-2 hidden w-28 drop-shadow-[0_0px_7px_rgba(255,255,255,0.75)] dark:inline-block"
            />
        </>
    );
}
