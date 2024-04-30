import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { authenticator } from "@/lib/auth.server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  const companyName = form.get("company") as string;
  const name = form.get("name") as string;
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  // Create the company
  const company = await prisma.company.create({
    data: {
      name: companyName,
    },
  });

  // Create the user
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Assign the user to the company
  await prisma.membership.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      company: {
        connect: {
          id: company.id,
        },
      },
    },
  });

  // we return a redirect response to the user's profile page
  return redirect("/auth/login");
}

export default function Signup() {
  return (
    <Card className="mx-auto max-w-sm mt-16 lg:mt-32">
      <CardHeader>
        <CardTitle className="text-2xl font-serif">
          Sign up for an account
        </CardTitle>
        <CardDescription>
          Simplify your security and compliance efforts in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                name="company"
                type="text"
                placeholder="Acme Inc."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Marcus Aurelius"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="marcus@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a href="/auth/login" className="underline">
              Login
            </a>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is already authenticated redirect to / directly
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}
