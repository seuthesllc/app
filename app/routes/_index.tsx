import { json, type MetaFunction } from "@remix-run/node";
import { authenticator } from "@/lib/auth.server";
import { useLoaderData } from "@remix-run/react";
import Shell from "@/components/layout/Shell";
import prisma from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Verified } from "lucide-react";
import { formatPentestType } from "@/lib/enums";
import dayjs from "dayjs";

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

function formatPentestStatus(status: string): JSX.Element {
  let variant = "";
  let displayStatus = status.charAt(0) + status.slice(1).toLowerCase();
  switch (status) {
    case "REQUESTED":
      variant = "secondary";
      break;
    case "IN_PROGRESS":
      variant = "secondary";
      displayStatus = "In Progress"; // Correctly format the display for "IN_PROGRESS"
      break;
    case "CANCELLED":
      variant = "destructive";
      break;
    case "COMPLETED":
      variant = ""; // Default or no specific variant
      break;
    default:
      return <Badge>Unknown Status</Badge>;
  }
  return <Badge variant={variant}>{displayStatus}</Badge>;
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <Shell heading="Dashboard">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-4">
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
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="font-serif tracking-normal text-gray-700">
                Pentests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Table>
                <TableHeader style={{ textAlign: "left" }}>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pentests.map((pentest) => (
                    <TableRow key={pentest.id}>
                      <TableCell>
                        <p className="font-medium">
                          {pentest.scope.name} -{" "}
                          {dayjs(pentest.date).format("MMMM YYYY")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPentestType(pentest.type)}
                        </p>
                      </TableCell>
                      <TableCell>
                        {formatPentestStatus(pentest.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="font-serif tracking-normal text-gray-700">
                Scopes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Table>
                <TableHeader style={{ textAlign: "left" }}>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Scope</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.scopes.map((scope) => (
                    <TableRow key={scope.id}>
                      <TableCell className="font-medium">
                        {scope.name}
                      </TableCell>
                      <TableCell>{scope.scope}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
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

  const pentests = await prisma.pentest.findMany({
    where: {
      companyId: firstMembership.companyId,
    },
    select: {
      id: true,
      type: true,
      status: true,
      date: true,
      scope: {
        select: {
          name: true,
        },
      },
    },
  });

  const scopes = await prisma.scope.findMany({
    where: {
      companyId: firstMembership.companyId,
    },
    select: {
      name: true,
      scope: true,
    },
  });

  const company = await prisma.company.findUnique({
    where: { id: firstMembership.companyId },
    include: {
      frameworks: true,
    },
  });

  return json({ user, company, pentests, scopes });
}
