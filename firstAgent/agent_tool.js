import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Tool for agent
const getWeatherTool = tool({
    name: "get_weather",
    description: "Return the current weather information for the given city",
    parameters: z.object({
        city: z.string().describe("name of the city"),
    }),
    execute: async function ({ city }) {
        // console.log(`⚙️ Calling Get Weather for ${city}`)
        const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;

        const response = await axios.get(url, { responseType: "text" });

        return `The weather of ${city} is ${response.data}`;
    },
});

const sendEmailTool = tool({
    name: "send_email",
    description: "This tool sends an email",
    parameters: z.object({
        toEmail: z.string().describe("email address to "),
        subject: z.string().describe("subject"),
        body: z.string().describe("body of the email"),
    }),
    execute: async function ({ toEmail, subject, body }) {
        const { data, error } = await resend.emails.send({
            from: "myWeatherAgent <onboarding@resend.dev>",
            to: toEmail,
            subject: subject,
            html: body,
        });

        if (error) {
            console.log("Error while sending email", error);
        }

        console.log("Email send successfully !");

        return data;
    },
});

// My Agent
const agent = new Agent({
    name: "Weather Agent",
    instructions: `You are an expert weather agent that helps user to tell weather report and also email the report to the user and also customised the report and make it pretty , body of mail should be html`,
    tools: [getWeatherTool, sendEmailTool],
});

// Main function
async function main(query = "") {
    const result = await run(agent, query);
    console.log(`Result: ${result.finalOutput}`);
}

main("What is the weather of Goa, Delhi and Kolkata? Also send me report on my mail Email: 'ap218905@gmail.com'");
