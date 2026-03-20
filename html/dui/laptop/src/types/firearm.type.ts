export interface Firearm {
    serial?: string;
    imperfections?: string;
    label: string;
    imagePath: string;
}

export interface RegisteredFirearm extends Firearm {
    identifier: string;
    registeredBy: string;
    registeredAt: number;
    reason: string;
    status: StatusId;
}

export const Status = {
    UNKNOWN: {
        id: "unknown",
        translationKey: "laptop.desktop_screen.firearms_registry_app.status.unknown",
        className: "bg-yellow-300",
        classNameHover: "hover:bg-yellow-300"
    },
    REGISTERED: {
        id: "registered",
        translationKey: "laptop.desktop_screen.firearms_registry_app.status.registered",
        className: "bg-green-300",
        classNameHover: "hover:bg-green-300"
    },
    LOST: {
        id: "lost",
        translationKey: "laptop.desktop_screen.firearms_registry_app.status.lost",
        className: "bg-red-300",
        classNameHover: "hover:bg-red-300"
    },
    STOLEN: {
        id: "stolen",
        translationKey: "laptop.desktop_screen.firearms_registry_app.status.stolen",
        className: "bg-orange-300",
        classNameHover: "hover:bg-orange-300"
    },
    CONFISCATED: {
        id: "confiscated",
        translationKey: "laptop.desktop_screen.firearms_registry_app.status.confiscated",
        className: "bg-blue-300",
        classNameHover: "hover:bg-blue-300"
    },
    DESTROYED: {
        id: "destroyed",
        translationKey: "laptop.desktop_screen.firearms_registry_app.status.destroyed",
        className: "bg-gray-400",
        classNameHover: "hover:bg-gray-400"
    },
    SUSPENDED: {
        id: "suspended",
        translationKey: "laptop.desktop_screen.firearms_registry_app.status.suspended",
        className: "bg-fuchsia-300",
        classNameHover: "hover:bg-fuchsia-300"
    }
} as const;

export type StatusType = typeof Status[keyof typeof Status];
export type StatusId = StatusType["id"];

export const getStatusById = (id: StatusId | undefined): StatusType | undefined => {
    return Object.values(Status).find((status) => status.id === id);
};