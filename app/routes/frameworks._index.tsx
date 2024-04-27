import { json, type MetaFunction } from "@remix-run/node";
import { authenticator } from "@/lib/auth.server";
import { useLoaderData } from "@remix-run/react";
import Shell from "@/components/layout/Shell";
import prisma from "@/lib/prisma";

import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Verified } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Frameworks() {
  const data = useLoaderData<typeof loader>();
  return (
    <Shell heading="Frameworks">
      <div className="flex mb-2">
        <div className="flex">
          <span className="text-xs text-gray-400 mt-auto">
            Showing {data.company?.frameworks.length} active frameworks
          </span>
        </div>
        <div className="ml-auto space-x-2">
          <a
            href="mailto:bailey@seuthes.com?subject=Add%20framework"
            className={"gap-1 " + buttonVariants({ size: "sm" })}
            style={{
              height: "32px",
            }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add framework
            </span>
          </a>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {data.company?.frameworks.map((framework) => (
          <Card key={framework.id}>
            <CardHeader>
              <CardTitle className="flex font-serif tracking-normal text-gray-700">
                <span>{framework.name}</span>
                {framework.completion ? (
                  <span className="ml-auto text-muted-foreground">
                    {framework.completion}%
                  </span>
                ) : null}
              </CardTitle>
              {framework.managed ? (
                <span className="text-xs text-gold-500 font-medium">
                  <Verified className="inline-block mr-0.5 -mt-[1px] w-4 h-4" />{" "}
                  Managed by Seuthes
                </span>
              ) : (
                <span className="text-xs text-gray-500 font-medium">
                  Self-managed
                </span>
              )}
            </CardHeader>
            <CardContent>
              {framework.completion ? (
                <Progress value={framework.completion} className="w-full" />
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
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
      frameworks: true,
    },
  });

  return json({ user, company });
}
