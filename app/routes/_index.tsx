import { Button } from "@/components/ui/button";
import { json, type MetaFunction } from "@remix-run/node";
import { authenticator } from "@/lib/auth.server";
import { useLoaderData } from "@remix-run/react";
import Shell from "@/components/layout/Shell";

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <Shell heading="Dashboard">
      <Button>Click me, {data.user?.name}</Button>
    </Shell>
  );
}

export async function loader({request}) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/auth/login",
  });

  return json({user});
}