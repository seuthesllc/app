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
  const controlSelfAssessmentFrequency = body.get("controlSelfAssessmentFrequency") || "";
  const vantaToken = body.get("vantaToken") || "";

  const updates = await prisma.company.update({
    where: { id: companyId },
    data: {
      name: name,
      frequencies: {
        pentest: parseInt(pentestFrequency),
        accessReview: parseInt(accessReviewFrequency),
        controlSelfAssessment: parseInt(controlSelfAssessmentFrequency),
      },
      vantaToken: vantaToken,
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
      <SettingsShell>
        <Form method="patch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700 tracking-normal font-serif dark:text-white">
                Company
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Button type="submit">Update company</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700 tracking-normal font-serif dark:text-white">
                Frequencies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="controlSelfAssessmentFrequency">
                  Control Self Assessment Frequency (in months)
                </Label>
                <Input
                  type="number"
                  id="controlSelfAssessmentFrequency"
                  name="controlSelfAssessmentFrequency"
                  defaultValue={data.company?.frequencies?.controlSelfAssessment || 1}
                />
              </div>
              <Button type="submit">Update frequencies</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-700 tracking-normal font-serif dark:text-white">
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="vantaToken">Vanta API Token</Label>
                <Input
                  type="text"
                  id="vantaToken"
                  name="vantaToken"
                  defaultValue={data.company?.vantaToken || ""}
                />
              </div>
              <Button type="submit">Update integrations</Button>
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
