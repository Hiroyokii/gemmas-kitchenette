import type { SVGAttributes } from "react";

export type IconName =
    | "menu"
    | "close"
    | "cart"
    | "user"
    | "logout"
    | "chevronDown"
    | "chevronRight"
    | "plus"
    | "minus"
    | "trash"
    | "check"
    | "clock"
    | "ticket"
    | "dashboard"
    | "bowl"
    | "leaf"
    | "book"
    | "calendar"
    | "bag"
    | "list"
    | "chart"
    | "mapPin"
    | "search"
    | "warning";

interface IconProps extends SVGAttributes<SVGSVGElement> {
    name: IconName;
}

const shared = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

export default function Icon({ name, className = "h-4 w-4", ...rest }: IconProps) {
    return (
        <svg {...shared} className={className} aria-hidden="true" {...rest}>
            {ICON_PATHS[name]}
        </svg>
    );
}

const ICON_PATHS: Record<IconName, React.ReactNode> = {
    menu: (
        <>
            <path d="M4 6h16M4 12h16M4 18h16" />
        </>
    ),
    close: <path d="M18 6L6 18M6 6l12 12" />,
    cart: (
        <>
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="17" cy="20" r="1.4" />
            <path d="M2.5 4h2l2.2 11.2a2 2 0 002 1.6h7.7a2 2 0 002-1.6L20 8H6" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="3.4" />
            <path d="M4.5 20a7.5 7.5 0 0115 0" />
        </>
    ),
    logout: (
        <>
            <path d="M9 4H5.5a1.5 1.5 0 00-1.5 1.5v13A1.5 1.5 0 005.5 20H9" />
            <path d="M14 8l4 4-4 4M18 12H9" />
        </>
    ),
    chevronDown: <path d="M6 9l6 6 6-6" />,
    chevronRight: <path d="M9 6l6 6-6 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    trash: (
        <>
            <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12.5A1.5 1.5 0 008.5 21h7a1.5 1.5 0 001.5-1.5L18 7" />
        </>
    ),
    check: <path d="M5 13l4 4L19 7" />,
    clock: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
        </>
    ),
    ticket: (
        <>
            <path d="M3 8.5A1.5 1.5 0 014.5 7h15A1.5 1.5 0 0121 8.5V10a2 2 0 000 4v1.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 15.5V14a2 2 0 000-4V8.5z" />
            <path d="M14 7v10" strokeDasharray="2 2.5" />
        </>
    ),
    dashboard: (
        <>
            <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
            <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5" />
            <rect x="13" y="10.5" width="7.5" height="10" rx="1.5" />
            <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.5" />
        </>
    ),
    bowl: (
        <>
            <path d="M3.5 12h17a7.5 6 0 01-17 0z" />
            <path d="M8 12c0-2.5 1.5-5 4-6.5M12 5c1.8.7 3.2 2 4 4" />
        </>
    ),
    leaf: (
        <>
            <path d="M5 19c8-1 12-6 13-13-8 1-12 6-13 13z" />
            <path d="M6 18c2-3 4.5-5.5 8-8" />
        </>
    ),
    book: (
        <>
            <path d="M4 5.5A1.5 1.5 0 015.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13z" />
            <path d="M20 5.5A1.5 1.5 0 0018.5 4H12v16h6.5a1.5 1.5 0 001.5-1.5v-13z" />
        </>
    ),
    calendar: (
        <>
            <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
            <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
        </>
    ),
    bag: (
        <>
            <path d="M6.5 8h11l1 12a1.5 1.5 0 01-1.5 1.5H7a1.5 1.5 0 01-1.5-1.5L6.5 8z" />
            <path d="M9 8V6.5a3 3 0 016 0V8" />
        </>
    ),
    list: (
        <>
            <path d="M8.5 6h11M8.5 12h11M8.5 18h11" />
            <circle cx="4.2" cy="6" r="1" />
            <circle cx="4.2" cy="12" r="1" />
            <circle cx="4.2" cy="18" r="1" />
        </>
    ),
    chart: (
        <>
            <path d="M4 20V10M11 20V4M18 20v-7" />
            <path d="M2.5 20h19" />
        </>
    ),
    mapPin: (
        <>
            <path d="M12 21s7-6.4 7-11.5a7 7 0 10-14 0C5 14.6 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.3" />
        </>
    ),
    search: (
        <>
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M20 20l-4.8-4.8" />
        </>
    ),
    warning: (
        <>
            <path d="M12 3.5L21.5 20h-19L12 3.5z" />
            <path d="M12 10v4M12 17.2h.01" />
        </>
    ),
};
