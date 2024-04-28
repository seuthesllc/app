import { json, type MetaFunction } from "@remix-run/node";
import { authenticator } from "@/lib/auth.server";
import { Link, useLoaderData } from "@remix-run/react";
import Shell from "@/components/layout/Shell";
import prisma from "@/lib/prisma";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, PlusCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import dayjs from "dayjs";

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Policies() {
  const data = useLoaderData<typeof loader>();
  const [policies, setPolicies] = useState([]);

  const fetchData = async () => {
    const response = await fetch("https://api.vanta.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${data.company?.vantaToken}`,
      },
      body: JSON.stringify({
        query: `query Policies {
            organization {
              policies {
                uid
                displayName
                approver {
                  displayName
                }
                approvedAt
                url
              }
            }
          }`,
      }),
    });

    const responseData = await response.json();
    setPolicies(responseData.data.organization.policies);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Shell heading="Policies">
      {policies.length === 0 ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
        <div className="flex mb-2">
        <div className="flex">
          <span className="text-xs text-gray-400 mt-auto">
            Showing {policies.length} available policies
          </span>
        </div>
        <div className="ml-auto space-x-2">
          <a
            href="https://app.vanta.com/policies"
            className={"gap-1 " + buttonVariants({ size: "sm" })}
            style={{
              height: "32px",
            }}
            target="_blank"
            rel="noreferrer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              New policy
            </span>
          </a>
        </div>
      </div>
        <Card>
          <CardContent className="p-2">
            <Table>
              <TableHeader style={{ textAlign: "left" }}>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead>Approval Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.uid}>
                    <TableCell className="font-medium">
                      {policy.displayName}
                    </TableCell>
                    <TableCell>{policy.approver.displayName}</TableCell>
                    <TableCell>{dayjs(policy.approvedAt).format("MMMM DD, YYYY")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link
                        to={policy.url}
                        className={
                          "gap-1 " +
                          buttonVariants({ variant: "outline", size: "sm" })
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          View
                        </span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </>
      )}
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
