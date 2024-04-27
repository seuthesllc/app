import {
  ActionFunctionArgs,
  json,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { authenticator } from "@/lib/auth.server";
import { Form, useLoaderData } from "@remix-run/react";
import Shell from "@/components/layout/Shell";
import prisma from "@/lib/prisma";
import { PlusCircle, Trash } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const method = request.method;

  if (method === "POST") {
    const body = new URLSearchParams(await request.text());
    const companyId = body.get("companyId") || "";
    const name = body.get("name") || "";
    const scope = body.get("scope") || "";

    // TODO: Verify the user is a member of the company

    // Create the new scope
    await prisma.scope.create({
      data: {
        company: {
          connect: {
            id: companyId,
          },
        },
        name: name,
        scope: scope,
      },
    });

    // Redirect the user to the scopes page
    return redirect(`/scopes`);
  } else if (method === "DELETE") {
    const body = new URLSearchParams(await request.text());
    const scopeId = body.get("scopeId") || "";

    // Delete the scope
    await prisma.scope.delete({
      where: {
        id: scopeId,
      },
    });

    return redirect(`/scopes`);
  }
}

export default function Scopes() {
  const data = useLoaderData<typeof loader>();
  return (
    <Shell heading="Scopes">
      <div className="flex mb-2">
        <div className="flex">
          <span className="text-xs text-gray-400 mt-auto">
            Showing {data.scopes.length} available scopes
          </span>
        </div>
        <div className="ml-auto space-x-2">
          <Sheet>
            <SheetTrigger>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  New scope
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-2xl font-serif">
                  Create a new scope
                </SheetTitle>
                <SheetDescription style={{ marginTop: "3px" }}>
                  Define a new scope for your pentests.
                </SheetDescription>
              </SheetHeader>
              <Form method="post" className="mt-6 space-y-8">
                <input
                  type="hidden"
                  name="companyId"
                  value={data.company?.companyId}
                />
                <div className="grid w-full max-w-sm items-center gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Acme Inc. Web App"
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Input
                    type="text"
                    id="scope"
                    name="scope"
                    placeholder="https://app.example.com"
                  />
                </div>
                <SheetFooter className="absolute bottom-0 right-0 flex justify-end p-4">
                  <SheetClose>
                    <Button size="sm" variant="outline" className="h-8">
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button size="sm" className="h-8 gap-1" type="submit">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Create
                    </span>
                  </Button>
                </SheetFooter>
              </Form>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card>
        <CardContent className="p-2">
          <Table>
            <TableHeader style={{ textAlign: "left" }}>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.scopes.map((scope) => (
                <TableRow key={scope.id}>
                  <TableCell className="font-medium">{scope.name}</TableCell>
                  <TableCell>{scope.scope}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* <Button size="sm" variant="outline" className="h-8 gap-1">
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Edit
                      </span>
                    </Button> */}
                    <Form method="delete">
                      <input type="hidden" name="scopeId" value={scope.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Delete
                        </span>
                      </Button>
                    </Form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Shell>
  );
}

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/auth/login",
  });

  const company = await prisma.membership.findFirst({
    where: {
      userId: user.id,
    },
  });

  const scopes = await prisma.scope.findMany({
    where: {
      companyId: company?.companyId,
    },
  });

  return json({ company, user, scopes });
}
