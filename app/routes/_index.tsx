import { Button } from "@/components/ui/button";
import { json, type MetaFunction } from "@remix-run/node";
import { authenticator } from "@/lib/auth.server";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1 className="font-serif">Welcome to {data.user?.name}</h1>
      <Button>Click me</Button>
    </div>
  );
}

export async function loader({request}) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return json({user});
}