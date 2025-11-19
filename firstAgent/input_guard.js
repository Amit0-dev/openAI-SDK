import "dotenv/config";
import { Agent, InputGuardrailTripwireTriggered, run } from "@openai/agents";
import { z } from "zod";

const mathInputAgent = new Agent({
    name: "Math query checker",
    instructions: `You are an input guardrail agent that checks if the user query is a math question or not.
        
        Rules:
        - The question has to be strictly a maths equation only.
        - Reject any other kind of request even if related to maths.
        `,

    outputType: z.object({
        isValidMathsQuestion: z.boolean().describe("If the question is a math question"),
        reason: z.string().optional().describe("reason to reject"),
    }),
});

const mathInputGuardrail = {
    name: "Math Homework Guardrail",
    execute: async ({ input }) => {
        // console.log("TODO: We need to validate - ", input);

        const result = await run(mathInputAgent, input);

        return {
            outputInfo: result.finalOutput.reason,

            tripwireTriggered: !result.finalOutput.isValidMathsQuestion, // <-- This value decides if we have to trigger
        };
    },
};

const mathAgent = new Agent({
    name: "Maths Agent",
    instructions: "You are an expert math ai agent.",
    inputGuardrails: [mathInputGuardrail],
});

async function main(query = "") {
    try {
        const result = await run(mathAgent, query);

        console.log("Result: ", result.finalOutput);
    } catch (e) {
        if (e instanceof InputGuardrailTripwireTriggered) {
            console.log(`Invalid Input: Rejected because ${e.message}`);
        }
    }
}

main("2 + 2 = ?");
