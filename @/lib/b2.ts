import B2 from "backblaze-b2";

export async function uploadFileToB2(bucket: string, file: File, subfolder: string): Promise<string> {
  const b2 = new B2({
    accountId: process.env.B2_ACCOUNT_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
  });

  await b2.authorize(); // Authorize with B2

  const uploadUrl = await b2.getUploadUrl({ bucketId: bucket });

  // Convert file to Buffer
  const buffer = await file.arrayBuffer();
  const data = Buffer.from(buffer);

  const response = await b2.uploadFile({
    uploadUrl: uploadUrl.data.uploadUrl,
    uploadAuthToken: uploadUrl.data.authorizationToken,
    fileName: `${subfolder}/${file.name}`, // Adjust naming as needed
    data: data, // File data for upload
  });

  return { fileId: response.data.fileId, fileName: response.data.fileName }; // Return the file ID and file name from the response
}

export async function getFileFromB2(fileId: string): Promise<string> {
  const b2 = new B2({
    accountId: process.env.B2_ACCOUNT_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
  });

  await b2.authorize(); // Authorize with B2

  const response = await b2.downloadFileById({
    fileId: fileId,
    responseType: 'arraybuffer', // Change responseType to 'arraybuffer'
  });

  // Convert arraybuffer to base64
  const base64data = Buffer.from(response.data).toString('base64');
  return base64data;
}

export async function deleteFileFromB2(fileId: string, fileName: string): Promise<boolean> {
  const b2 = new B2({
    accountId: process.env.B2_ACCOUNT_ID as string, // Ensuring accountId is not undefined
    applicationKey: process.env.B2_APPLICATION_KEY as string, // Ensuring applicationKey is not undefined
  });

  await b2.authorize(); // Authorize with B2

  try {
    await b2.deleteFileVersion({
      fileId: fileId,
      fileName: fileName
    });
    return true; // Return true if deletion is successful
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false; // Return false if deletion fails
  }
}