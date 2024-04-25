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
import { CircleUser } from "lucide-react";

interface ShellProps {
  heading: string;
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Frameworks", href: "/frameworks" },
  { name: "Pentests", href: "/pentests" },
];

export default function Shell({ heading, children }: ShellProps) {
  const location = useLocation();
  return (
    <>
      <header className="flex px-8 py-4 border-b">
        <span className="text-[1.6rem] font-serif text-gold-400">Seuthes</span>
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
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full text-black"
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
      <main className="m-8">
        <h1 className="font-serif text-3xl mb-4">{heading}</h1>
        {children}
      </main>
    </>
  );
}
