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

export default function CSA() {
  const data = useLoaderData<typeof loader>();
  return (
    <Shell heading={`Control Self Assessment - ${dayjs(data.controlSelfAssessment?.date).format("MMMM YYYY")}`}>
      {data.controlSelfAssessment?.base64Pdf ? (
        <iframe
          src={`data:application/pdf;base64,${data.controlSelfAssessment.base64Pdf}`}
          className="w-full h-full"
          title="Control Self Assessment"
        />
      ) : (
        <p>No CSA uploaded</p>
      )}
    </Shell>
  );
}

export async function loader({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/auth/login",
  });

  const controlSelfAssessment = await prisma.controlSelfAssessment.findUnique({
    where: { id: params.id },
  });

  let base64Pdf = null;
  if (controlSelfAssessment?.fileId) {
    base64Pdf = await getFileFromB2(controlSelfAssessment.fileId);
  }

  return json({ user, controlSelfAssessment: { ...controlSelfAssessment, base64Pdf } });
}
