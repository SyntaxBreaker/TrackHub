import { NextApiRequest, NextApiResponse } from "next";
import { prismaClient } from "../../../utils/prisma";

const prisma = prismaClient;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const project = req.body;

    await prisma.project.create({
      data: {
        ...project,
        tasks: {
          create: [],
        },
      },
    });

    res.status(201).json("Project was created");
  } catch (err) {
    res.status(500).json(err);
  }
}
