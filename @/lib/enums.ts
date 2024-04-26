export function formatPentestType(type: string): string {
    switch (type) {
        case "WEB_BLACKBOX":
            return "Web Application - Blackbox";
        case "WEB_GREYBOX":
            return "Web Application - Greybox";
        case "WEB_WHITEBOX":
            return "Web Application - Whitebox";
        default:
            return "Unknown Type";
    }
}