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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const body = new URLSearchParams(await request.text());
  const method = body.get("_method") || request.method;
  const userId = body.get("userId") || "";
  const companyId = body.get("companyId") || "";

  if (method.toLowerCase() === "delete") {
    await prisma.membership.delete({
      where: { userId_companyId: { userId, companyId: companyId } },
    });

    return json({ updates: "User removed" });
  }
}

export default function Team() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  // If there are any updates, show a toast
  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        toast.error(actionData.error);
      } else {
        toast.success("Team updated");
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
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader style={{ textAlign: "left" }}>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.company?.memberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell>{membership.user.name}</TableCell>
                      <TableCell>{membership.user.email}</TableCell>
                      <TableCell className="text-right">
                        <Form method="post">
                          <input type="hidden" name="_method" value="delete" />
                          <input
                            type="hidden"
                            name="companyId"
                            value={data.company?.id}
                          />
                          <input
                            type="hidden"
                            name="userId"
                            value={membership.user.id}
                          />
                          <Button type="submit" variant="destructive" size="sm">
                            Remove
                          </Button>
                        </Form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
    include: {
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return json({ user, company });
}
