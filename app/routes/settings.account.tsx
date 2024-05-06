import { ActionFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import { authenticator } from "@/lib/auth.server";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import Shell from "@/components/layout/Shell";
import prisma from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import SettingsShell from "@/components/layout/SettingsShell";
import bcrypt from "bcryptjs";

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const body = new URLSearchParams(await request.text());
  const userId = body.get("userId") || "";
  const name = body.get("name") || "";
  const email = body.get("email") || "";
  const password = body.get("password") || "";
  const passwordConfirm = body.get("passwordConfirm") || "";

  if (password && passwordConfirm) {
    if (password !== passwordConfirm) {
      return json({ error: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return json({ message: "Password changed" });
  }

  const updates = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name,
      email: email,
    },
  });

  return json({ updates });
}

export default function Settings() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  // If there are any updates, show a toast
  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        toast.error(actionData.error);
      } else {
        toast.success("Profile updated");
      }
    }
  }, [actionData?.updates]);

  return (
    <Shell heading="Settings">
      <Toaster position="bottom-right" />
      <SettingsShell>
        <Form method="patch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700 tracking-normal font-serif dark:text-white">
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input type="hidden" name="userId" value={data.user?.id} />
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={data.user?.name}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="text"
                  id="email"
                  name="email"
                  defaultValue={data.user?.email}
                />
              </div>
              <Button type="submit">Update profile</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700 tracking-normal font-serif dark:text-white">Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="password">New password</Label>
                <Input type="password" id="password" name="password" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="passwordConfirm">Confirm password</Label>
                <Input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                />
              </div>
              <Button type="submit">Change password</Button>
            </CardContent>
          </Card>
        </Form>
      </SettingsShell>
    </Shell>
  );
}

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/auth/login",
  });

  const firstMembership = await prisma.membership.findFirst({
    where: { userId: user.id },
  });

  const company = await prisma.company.findUnique({
    where: { id: firstMembership.companyId },
  });

  return json({ user, company });
}
