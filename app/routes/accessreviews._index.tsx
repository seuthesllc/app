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

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    const url = body.get("url") || "";
    const date = body.get("date") || "";

    // TODO: Verify the user is a member of the company

    // Create the new access review
    await prisma.accessReview.create({
      data: {
        company: {
          connect: {
            id: companyId,
          },
        },
        url: url,
        date: date,
      },
    });

    // Redirect the user to the access reviews page
    return redirect(`/accessreviews`);
  } else if (method === "DELETE") {
    const body = new URLSearchParams(await request.text());
    const accessReviewId = body.get("accessReviewId") || "";

    // Delete the access review
    await prisma.accessReview.delete({
      where: {
        id: accessReviewId,
      },
    });

    return redirect(`/accessreviews`);
  }
}

export default function AccessReviews() {
  const data = useLoaderData<typeof loader>();
  return (
    <Shell heading="Access Reviews">
      <div className="flex mb-2">
        <div className="flex">
          <span className="text-xs text-gray-400 mt-auto">
            Showing {data.accessReviews.length} available access reviews
          </span>
        </div>
        <div className="ml-auto space-x-2">
          <Sheet>
            <SheetTrigger>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  New access review
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-2xl font-serif">
                  Create an access review
                </SheetTitle>
                <SheetDescription style={{ marginTop: "3px" }}>
                  Record a new access review for your company.
                </SheetDescription>
              </SheetHeader>
              <Form method="post" className="mt-6 space-y-8">
                <input
                  type="hidden"
                  name="companyId"
                  value={data.company?.companyId}
                />
                <div className="grid w-full max-w-sm items-center gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="text"
                    id="date"
                    name="date"
                    placeholder="2024-01-01"
                    defaultValue={new Date().toISOString()}
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    type="text"
                    id="url"
                    name="url"
                    placeholder="https://drive.google.com"
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

      {data.accessReviews.length === 0 ? (
        <Alert>
          <AlertTitle className="text-2xl font-serif tracking-normal text-gray-700 dark:text-white">
            No access reviews
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            You haven&apos;t recorded any access reviews yet.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardContent className="p-2">
            <Table>
              <TableHeader style={{ textAlign: "left" }}>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.accessReviews.map((accessReview) => (
                  <TableRow key={accessReview.id}>
                    <TableCell className="font-medium">{accessReview.date}</TableCell>
                    <TableCell>{accessReview.url}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* <Button size="sm" variant="outline" className="h-8 gap-1">
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Edit
                      </span>
                    </Button> */}
                      <Form method="delete">
                        <input type="hidden" name="accessReviewId" value={accessReview.id} />
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
      )}
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

  const accessReviews = await prisma.accessReview.findMany({
    where: {
      companyId: company?.companyId,
    },
  });

  return json({ company, accessReviews });
}