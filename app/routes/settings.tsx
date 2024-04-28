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

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const body = new URLSearchParams(await request.text());
  const companyId = body.get("companyId") || "";
  const name = body.get("name") || "";
  const pentestFrequency = body.get("pentestFrequency") || "";
  const accessReviewFrequency = body.get("accessReviewFrequency") || "";

  const updates = await prisma.company.update({
    where: { id: companyId },
    data: {
      name: name,
      frequencies: {
        pentest: parseInt(pentestFrequency),
        accessReview: parseInt(accessReviewFrequency),
      },
    },
  });

  return json({ updates });
}

export default function Settings() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  // If there are any updates, show a toast
  useEffect(() => {
    if (actionData?.updates) {
      toast.success("Company settings updated");
    }
  }, [actionData?.updates]);

  return (
    <Shell heading="Settings">
      <Toaster position="bottom-right" />
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-700 tracking-normal font-serif dark:text-white">
            Company
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="patch" className="space-y-4">
            <input type="hidden" name="companyId" value={data.company?.id} />
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                defaultValue={data.company?.name}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="pentestFrequency">
                Pentest Frequency (in months)
              </Label>
              <Input
                type="number"
                id="pentestFrequency"
                name="pentestFrequency"
                defaultValue={data.company?.frequencies?.pentest || 12}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="accessReviewFrequency">
                Access Review Frequency (in months)
              </Label>
              <Input
                type="number"
                id="accessReviewFrequency"
                name="accessReviewFrequency"
                defaultValue={data.company?.frequencies?.accessReview || 3}
              />
            </div>
            <Button type="submit">Update company</Button>
          </Form>
        </CardContent>
      </Card>
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
