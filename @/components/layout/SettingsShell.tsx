import { Link, useLocation } from "@remix-run/react";

const settingsNavigation = [
  {
    label: "Account",
    href: "/settings/account",
  },
  {
    label: "Company",
    href: "/settings/company",
  },
];

export default function SettingsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  return (
    <div className="lg:flex gap-4">
      <div id="sidebar" className="lg:w-1/5">
        <div className="flex flex-col gap-2 font-medium">
          {settingsNavigation.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`${
                location.pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              } transition-colors hover:text-foreground`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div id="settings" className="lg:w-4/5">
        {children}
      </div>
    </div>
  );
}
