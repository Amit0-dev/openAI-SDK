import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import {RECOMMENDED_PROMPT_PREFIX} from "@openai/agents-core/extensions";
import { z } from "zod";
import fs from "node:fs/promises";

// refundAgent Agent

const processRefund = tool({
    name: "process_refund",
    description: `
    This tool processes the refund for a customer
    `,
    parameters: z.object({
        customerId: z.string().describe("Id of the customer"),
        reason: z.string().describe("reason for the  refund"),
    }),
    execute: async function ({ customerId, reason }) {
        await fs.appendFile(
            "./refunds.txt",
            `Refund for Customer having ID ${customerId} for ${reason}`,
            "utf-8"
        );

        return { refundIssued: true };
    },
});

const refundAgent = new Agent({
    name: "Refund Agent",
    instructions: `
    You are expert in issuing refunds to the customer, Also ask user for the reason of the refund.
    `,
    tools: [processRefund],
});

// sales Agent

const fetchAvailablePlans = tool({
    name: "fetch_available_plans",
    description: "fetches the available plans for the internet",
    parameters: z.object({}),
    execute: async function () {
        return [
            {
                plan_id: "1",
                price_inr: 399,
                speed: "30MB/s",
            },
            {
                plan_id: "2",
                price_inr: 999,
                speed: "100MB/s",
            },
            {
                plan_id: "1",
                price_inr: 1499,
                speed: "200MB/s",
            },
        ];
    },
});

const salesAgent = new Agent({
    name: "Sales Agent",
    instructions: `
    You are an expert sales agent for an internet broadband company.
    Talk to the user and help them with what they need.
    `,
    tools: [
        fetchAvailablePlans,
        refundAgent.asTool({
            toolName: "refund_expert",
            toolDescription: "Handles refund questions and requests",
        }),
    ],
});

// Reception Agent

const receptionAgent = new Agent({
    name: "Reception Agent",
    instructions: `${RECOMMENDED_PROMPT_PREFIX}
    You are the customer facing agent expert in understanding what customer needs and then route them or handoff them to the right agent.
    `,
    handoffDescription: `
    You have two agent available: 
        - salesAgent: Expert in handling queries like all plans and pricing available, Good for new customer;
        - refundAgent: Expert in handling user queries for existing customers and issue refunds and help them;
    `,
    handoffs: [salesAgent, refundAgent],
});

async function main(query = "") {
    const result = await run(receptionAgent, query);

    console.log(`Result: `, result.finalOutput);
    console.log(`History: `, result.history);
}

// main('Hey there, Can you tell me what plan best for me ? I need it for mySelf. Please tell me all the plans you have.')

main(
    "Hi There, I am cutomer having id cust_234 and i want a refund because i am facing slow internet issues."
);
