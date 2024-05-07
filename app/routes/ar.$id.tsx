import { json, type MetaFunction } from "@remix-run/node";
import { authenticator } from "@/lib/auth.server";
import { useLoaderData } from "@remix-run/react";
import Shell from "@/components/layout/Shell";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import { getFileFromB2 } from "@/lib/b2"; // Import the function

export const meta: MetaFunction = () => {
  return [
    { title: "Seuthes" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function AR() {
  const data = useLoaderData<typeof loader>();
  return (
    <Shell heading={`Access Review - ${dayjs(data.accessReview?.date).format("MMMM YYYY")}`}>
      {data.accessReview?.base64Pdf ? (
        <iframe
          src={`data:application/pdf;base64,${data.accessReview.base64Pdf}`}
          className="w-full h-full"
          title="Access Review"
        />
      ) : (
        <p>No AR uploaded</p>
      )}
    </Shell>
  );
}

export async function loader({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/auth/login",
  });

  const accessReview = await prisma.accessReview.findUnique({
    where: { id: params.id },
  });

  let base64Pdf = null;
  if (accessReview?.fileId) {
    base64Pdf = await getFileFromB2(accessReview.fileId);
  }

  return json({ user, accessReview: { ...accessReview, base64Pdf } });
}
