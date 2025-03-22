"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateAIInsights = async (industry) => {
  if (!industry) throw new Error("Industry is required for AI insights");

  const prompt = `Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format:
  {
    "salaryRanges": [
      { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
    ],
    "growthRate": number,
    "demandLevel": "High" | "Medium" | "Low",
    "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "marketOutlook": "Positive" | "Neutral" | "Negative",
    "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
    "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
  }
  IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Ensure only JSON is parsed
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating AI insights:", error.message);
    throw new Error("Failed to generate industry insights");
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  // ✅ Fix: If the user has no industry, return null instead of throwing an error
  if (!user.industry) {
    console.warn("User industry is missing. Returning null.");
    return null;
  }

  try {
    let industryInsight = await db.industryInsight.findUnique({
      where: { industry: user.industry },
    });

    if (!industryInsight) {
      console.log(`Generating new insights for industry: ${user.industry}`);
      const insights = await generateAIInsights(user.industry);

      industryInsight = await db.industryInsight.create({
        data: {
          industry: user.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return industryInsight;
  } catch (error) {
    console.error("Error fetching industry insights:", error.message);
    throw new Error("Failed to fetch industry insights");
  }
}
