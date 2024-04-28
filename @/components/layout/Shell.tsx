import { Form, Link, useLocation } from "@remix-run/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CircleUser, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface ShellProps {
  heading: string;
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Frameworks", href: "/frameworks" },
  { name: "Pentests", href: "/pentests" },
  { name: "Scopes", href: "/scopes" },
  { name: "Policies", href: "/policies" },
  { name: "Settings", href: "/settings" },
];

export default function Shell({ heading, children }: ShellProps) {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle("dark", newDarkMode);
    localStorage.setItem("darkMode", newDarkMode ? "true" : "false");
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === "true");
      document.body.classList.toggle("dark", savedDarkMode === "true");
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.body.classList.add("dark");
    }
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <header className="sticky top-0 bg-white dark:bg-black flex px-8 py-4 border-b">
        <Link to="/" className="text-[1.6rem] font-serif text-gold-400">
          Seuthes
        </Link>
        <nav className="ml-8 space-x-6 flex items-center text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                location.pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              } transition-colors hover:text-foreground`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto space-x-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full text-black dark:text-white"
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle dark mode</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full text-black dark:text-white"
              >
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Form action="/auth/logout" method="post">
                  <button type="submit">Logout</button>
                </Form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-8 bg-muted/40 dark:bg-black/90">
        <h1 className="font-serif text-3xl text-gray-700 dark:text-white mb-4">
          {heading}
        </h1>
        {children}
      </main>
    </div>
  );
}

